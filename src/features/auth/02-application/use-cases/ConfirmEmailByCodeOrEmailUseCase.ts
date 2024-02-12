import { UsersRepository } from '../../../users/04-repositories/users-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class ConfirmEmailByCodeOrEmailCommand {
    constructor(public codeOrEmail: string) {}
}
@CommandHandler(ConfirmEmailByCodeOrEmailCommand)
export class ConfirmEmailByCodeOrEmailUseCase implements ICommandHandler<ConfirmEmailByCodeOrEmailCommand> {
    constructor(private usersRepository: UsersRepository) {}

    async execute(command: ConfirmEmailByCodeOrEmailCommand): Promise<boolean> {
        const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(command.codeOrEmail);
        if (!user) return false;
        if (user.emailConfirmation.expirationDate < new Date()) return false;

        const result = await this.usersRepository.confirmUserById(user._id);
        return result;
    }
}
