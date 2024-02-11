import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/04-repositories/users-repository';

@Injectable()
export class ConfirmEmailByCodeOrEmailUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute(codeOrEmail: string): Promise<boolean> {
        const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(codeOrEmail);
        if (!user) return false;
        if (user.emailConfirmation.expirationDate < new Date()) return false;

        const result = await this.usersRepository.confirmUserById(user._id);
        return result;
    }
}
