import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/04-repositories/users-repository';
import { EmailManager } from '../../../../application/adapters/email-adapter/emailManager';
import { CryptoService } from '../../../../application/adapters/crypto/crypto-service';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserModel } from '../../../users/03-domain/user-db-model';
import { CreateUserInputModel } from '../../../users/05-dto/CreateUserInputModel';
import { UserViewModel } from '../../../users/types/user-view-model';

@Injectable()
export class CreateUserUseCase {
    constructor(
        private usersRepository: UsersRepository,
        private emailManager: EmailManager,
        private cryptoService: CryptoService,
        @InjectModel(User.name) private userModel: UserModel,
    ) {}

    async execute(userInput: CreateUserInputModel): Promise<UserViewModel | null> {
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
}
