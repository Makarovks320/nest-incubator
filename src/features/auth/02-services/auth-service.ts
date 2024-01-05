import bcrypt from 'bcrypt';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import add from 'date-fns/add';
import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/04-repositories/users-repository';
import { JwtService } from '../../../application/adapters/jwt-service';
import { EmailManager } from '../../../application/managers/emailManager';
import { EmailConfirmationType, User, UserDocument } from '../../users/03-domain/user-db-model';

@Injectable()
export class AuthService {
    constructor(
        private usersRepository: UsersRepository,
        private jwtService: JwtService,
        private emailManager: EmailManager,
    ) {}

    async confirmEmailByCodeOrEmail(codeOrEmail: string): Promise<boolean> {
        const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(codeOrEmail);
        if (!user) return false;
        if (user.emailConfirmation.expirationDate < new Date()) return false;

        const result = await this.usersRepository.confirmUserById(user._id);
        return result;
    }

    async sendEmailWithNewCode(email: string): Promise<boolean> {
        const user: UserDocument | null = await this.usersRepository.findUserByConfirmationCodeOrEmail(email);
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
        const passwordRecoveryCode = await this.jwtService.createAccessToken(userDB._id);
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
}
