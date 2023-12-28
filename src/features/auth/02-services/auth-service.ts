import bcrypt from "bcrypt";
import {ObjectId} from "mongodb";
import {v4 as uuidv4} from "uuid";
import add from "date-fns/add";
import {UsersRepository} from "../repositories/users-repository";
import {EmailManager} from "../managers/emailManager";
import {EmailConfirmationType, UserDBModel} from "../models/user/user-db-model";
import {JwtService} from "../application/jwt-service";
import {inject, injectable} from "inversify";

@injectable()
export class AuthService {
  constructor(
      @inject(UsersRepository) private usersRepository: UsersRepository,
      @inject(JwtService) private jwtService: JwtService,
      @inject(EmailManager) private emailManager: EmailManager
  ) {
  }

  async createUser(login: string, email: string, password: string): Promise<UserDBModel | null> {
    const passwordSalt = await bcrypt.genSalt(8);
    const passwordHash = await this._generateHash(password, passwordSalt);
    const user = new UserDBModel(
        new ObjectId(),
        {
          userName: login,
          email,
          salt: passwordSalt,
          hash: passwordHash,
          createdAt: (new Date()).toISOString()
        },
        {
          confirmationCode: uuidv4(),
          expirationDate: add(new Date(), {minutes: 15}),
          isConfirmed: false
        },
        {
          passwordRecoveryCode: "",
          active: false
        });
    const createResult = await this.usersRepository.createUser(user);
    const sendEmailResult = await this.emailManager.sendConformationCode(email, user.emailConfirmation.confirmationCode);
    if (!sendEmailResult) {
      await this.usersRepository.deleteUserById(user._id);
      return null;
    }
    return createResult;
  }

  async confirmEmailByCodeOrEmail(codeOrEmail: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(codeOrEmail);
    if (!user) return false;
    if (user.emailConfirmation.expirationDate < new Date()) return false;

    const result = await this.usersRepository.confirmUserById(user._id);
    return result;
  }

  async sendEmailWithNewCode(email: string): Promise<boolean> {
    const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(email);
    if (!user) return false;
    if (user.emailConfirmation.isConfirmed) return false;
    const emailConfirmation: EmailConfirmationType = {
      confirmationCode: uuidv4(),
      expirationDate: add(new Date(), {minutes: 15}),
      isConfirmed: false
    }
    await this.usersRepository.updateConfirmationCode(user._id, emailConfirmation);
    const sendEmailResult = await this.emailManager.sendNewConformationCode(user.accountData.email, emailConfirmation.confirmationCode)
    return sendEmailResult; //todo: как я могу уверенно вернуть true, если я не могу контролировать emailManager?

  }

  async _generateHash(password: string, salt: string) {
    return await bcrypt.hash(password, salt);
  }

  async sendEmailWithRecoveryPasswordCode(email: string): Promise<boolean> {
    const userDB: UserDBModel | null = await this.usersRepository.findUserByLoginOrEmail(email)
    // Return true even if current email is not registered (for prevent user's email detection)
    if (!userDB) return true;
    const passwordRecoveryCode = await this.jwtService.createAccessToken(userDB._id);
    await this.usersRepository.addPassRecoveryCode(userDB._id, passwordRecoveryCode);

    const sendEmailResult = await this.emailManager.sendPasswordRecoveryMessage(userDB.accountData.email, passwordRecoveryCode);
    if (!sendEmailResult) {
      return false;
    }
    return true;
  }

  async updatePassword(newPassword: string, userId: ObjectId): Promise<boolean> {
    const user: UserDBModel | null = await this.usersRepository.getUserById(userId);
    if (!user) return false;
    const passwordSalt: string = user.accountData.salt;
    const newPasswordHash = await this._generateHash(newPassword, passwordSalt);
    return await this.usersRepository.updatePassword(newPasswordHash, userId);
  }
}
