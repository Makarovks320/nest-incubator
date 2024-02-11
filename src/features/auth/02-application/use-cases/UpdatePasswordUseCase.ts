import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../../users/04-repositories/users-repository';
import bcrypt from 'bcrypt';
import { UserDocument } from '../../../users/03-domain/user-db-model';

@Injectable()
export class UpdatePasswordUseCase {
    constructor(private usersRepository: UsersRepository) {}

    async execute(newPassword: string, userId: string): Promise<boolean> {
        const user: UserDocument | null = await this.usersRepository.findUserById(userId);
        if (!user) return false;
        const passwordSalt: string = user.accountData.salt;
        const newPasswordHash = await this._generateHash(newPassword, passwordSalt);
        return await this.usersRepository.updatePassword(newPasswordHash, userId);
    }
    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt);
    }
}
