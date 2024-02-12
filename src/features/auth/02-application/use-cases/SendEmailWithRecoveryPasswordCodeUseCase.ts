import { UsersRepository } from '../../../users/04-repositories/users-repository';
import { EmailManager } from '../../../../application/adapters/email-adapter/emailManager';
import { UserDocument } from '../../../users/03-domain/user-db-model';
import { JwtService } from '../../../../application/adapters/jwt/jwt-service';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class SendEmailWithRecoveryPasswordCodeCommand {
    constructor(public email: string) {}
}
@CommandHandler(SendEmailWithRecoveryPasswordCodeCommand)
export class SendEmailWithRecoveryPasswordCodeUseCase
    implements ICommandHandler<SendEmailWithRecoveryPasswordCodeCommand>
{
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager,
        private jwtService: JwtService,
    ) {}

    async execute(command: SendEmailWithRecoveryPasswordCodeCommand): Promise<boolean> {
        const userDB: UserDocument | null = await this.usersRepository.findUserByLoginOrEmail(command.email);
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
}
