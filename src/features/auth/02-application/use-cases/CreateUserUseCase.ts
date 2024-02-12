import { UsersRepository } from '../../../users/04-repositories/users-repository';
import { EmailManager } from '../../../../application/adapters/email-adapter/emailManager';
import { CryptoService } from '../../../../application/adapters/crypto/crypto-service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from '../../../users/03-domain/user-db-model';
import { CreateUserInputModel } from '../../../users/05-dto/CreateUserInputModel';
import { UserViewModel } from '../../../users/types/user-view-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
export class CreateUserCommand {
    constructor(public userInput: CreateUserInputModel) {}
}
@CommandHandler(CreateUserCommand)
export class CreateUserUseCase implements ICommandHandler<CreateUserCommand> {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager,
        private cryptoService: CryptoService,
        @InjectModel(User.name) private userModel: UserModel,
    ) {}

    async execute(command: CreateUserCommand): Promise<UserViewModel | null> {
        const cryptedData = await this.cryptoService.getCryptedData(command.userInput.password);
        const user = await this.userModel.createUser(command.userInput, cryptedData);
        const result = await this.usersRepository.save(user);
        const sendEmailResult = await this.emailManager.sendConfirmationCode(
            command.userInput.email,
            user.emailConfirmation.confirmationCode,
        );
        if (!sendEmailResult) {
            await this.usersRepository.deleteUserById(result.id);
            return null;
        }

        return result;
    }
}
