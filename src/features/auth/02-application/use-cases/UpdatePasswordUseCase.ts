import { UsersRepository } from '../../../users/04-repositories/users-repository';
import bcrypt from 'bcrypt';
import { UserDocument } from '../../../users/03-domain/user-db-model';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class UpdatePasswordCommand {
    constructor(
        public newPassword: string,
        public userId: string,
    ) {}
}
@CommandHandler(UpdatePasswordCommand)
export class UpdatePasswordUseCase implements ICommandHandler<UpdatePasswordCommand> {
    constructor(private usersRepository: UsersRepository) {}

    async execute(command: UpdatePasswordCommand): Promise<boolean> {
        const user: UserDocument | null = await this.usersRepository.findUserById(command.userId);
        if (!user) return false;
        const passwordSalt: string = user.accountData.salt;
        const newPasswordHash = await this._generateHash(command.newPassword, passwordSalt);
        return await this.usersRepository.updatePassword(newPasswordHash, command.userId);
    }
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt);
    }
}
