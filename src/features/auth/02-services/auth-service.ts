import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/04-repositories/users-repository';
import { JwtService, AuthTokenPair } from '../../../application/adapters/jwt/jwt-service';
import { EmailManager } from '../../../application/adapters/email-adapter/emailManager';
import { EmailConfirmationType, User, UserDocument, UserModel } from '../../users/03-domain/user-db-model';
import { CreateUserInputDto } from '../../users/05-dto/CreateUserInputDto';
import { UserViewModel } from '../../users/types/user-view-model';
import { InjectModel } from '@nestjs/mongoose';
import { CryptoService } from '../../../application/adapters/crypto/crypto-service';
import { AuthLoginInputDto } from '../05-dto/AuthLoginInputDto';
import { UserService } from '../../users/02-services/user-service';
import { SessionService } from './session-service';

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private userService: UserService,
        private sessionService: SessionService,
        private jwtService: JwtService,
        private emailManager: EmailManager,
        private cryptoService: CryptoService,
        @InjectModel(User.name) private userModel: UserModel,
    ) {}

    async createUser(userInput: CreateUserInputDto): Promise<UserViewModel | null> {
        const cryptedData = await this.cryptoService.getCryptedData(userInput.password);
        const user = await this.userModel.createUser(userInput, cryptedData);
        const result = await this.usersRepository.save(user);
        const sendEmailResult = await this.emailManager.sendConfirmationCode(
            userInput.email,
            user.emailConfirmation.confirmationCode,
        );
        if (!sendEmailResult) {
            await this.usersRepository.deleteUserById(result.id);
            return null;
        }

        return result;
    }
    async confirmEmailByCodeOrEmail(codeOrEmail: string): Promise<boolean> {
        const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(codeOrEmail);
        if (!user) return false;
        if (user.emailConfirmation.expirationDate < new Date()) return false;

        const result = await this.usersRepository.confirmUserById(user._id);
        return result;
    }

    async sendEmailWithNewCode(email: string): Promise<boolean> {
        const user: UserDocument | null = await this.usersRepository.findUserByLoginOrEmail(email);
        if (!user) return false;
        if (user.emailConfirmation.isConfirmed) return false;
        const emailConfirmation: EmailConfirmationType = {
            confirmationCode: uuidv4(),
            expirationDate: add(new Date(), { minutes: 15 }),
            isConfirmed: false,
        };
        await this.usersRepository.updateConfirmationCode(user._id, emailConfirmation);
        const sendEmailResult = await this.emailManager.sendNewConformationCode(
            user.email,
            emailConfirmation.confirmationCode,
        );
        return sendEmailResult; //todo: как я могу уверенно вернуть true, если я не могу контролировать emailManager?
    }

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt);
    }

    async sendEmailWithRecoveryPasswordCode(email: string): Promise<boolean> {
        const userDB: UserDocument | null = await this.usersRepository.findUserByLoginOrEmail(email);
        // Return true even if current email is not registered (for prevent user's email detection)
        if (!userDB) return true;
        const passwordRecoveryCode = await this.jwtService.createAccessToken(userDB._id.toString());
        await this.usersRepository.addPassRecoveryCode(userDB.id, passwordRecoveryCode);

        const sendEmailResult = await this.emailManager.sendPasswordRecoveryMessage(userDB.email, passwordRecoveryCode);
        if (!sendEmailResult) {
            return false;
        }
        return true;
    }

    async updatePassword(newPassword: string, userId: string): Promise<boolean> {
        const user: UserDocument | null = await this.usersRepository.findUserById(userId);
        if (!user) return false;
        const passwordSalt: string = user.accountData.salt;
        const newPasswordHash = await this._generateHash(newPassword, passwordSalt);
        return await this.usersRepository.updatePassword(newPasswordHash, userId);
    }

    async loginUser(input: AuthLoginInputDto, ip: string, deviceName: string | null): Promise<AuthTokenPair | null> {
        const user: UserDocument | null = await this.userService.checkCredentials(input.loginOrEmail, input.password);
        if (!user) return null;

        // todo: если есть валидный рефреш-токен, сделать перезапись сессии вместо создания новой
        // подготавливаем данные для сохранения сессии:
        const deviceId: string = uuidv4();

        // создаем токены
        const accessToken: string = await this.jwtService.createAccessToken(user._id.toString());
        const refreshToken: string = await this.jwtService.createRefreshToken(user._id.toString(), deviceId);

        // сохраняем текущую сессию:
        await this.sessionService.addSession(ip, deviceId, deviceName, refreshToken);

        return {
            accessToken,
            refreshToken,
        };
    }
}
