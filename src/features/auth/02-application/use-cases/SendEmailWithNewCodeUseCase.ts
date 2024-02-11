import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/04-repositories/users-repository';
import { EmailManager } from '../../../../application/adapters/email-adapter/emailManager';
import { EmailConfirmationType, UserDocument } from '../../../users/03-domain/user-db-model';
import add from 'date-fns/add';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SendEmailWithNewCodeUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager,
    ) {}

    async execute(email: string): Promise<boolean> {
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
}
