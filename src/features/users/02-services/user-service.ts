import { UsersRepository } from '../04-repositories/users-repository';
import { User, UserDocument } from '../03-domain/user-db-model';
import { Injectable } from '@nestjs/common';
import { UserViewModel } from '../types/user-view-model';
import bcrypt from 'bcrypt';
import { CreateUserInputDto } from '../05-dto/CreateUserInputDto';

@Injectable()
export class UserService {
    constructor(private usersRepository: UsersRepository) {}

    async createUser(userInput: CreateUserInputDto): Promise<UserViewModel> {
        const user: User = await User.createUser(userInput);
        return await this.usersRepository.save(user);
    }

    async findUserById(id: string): Promise<UserDocument | null> {
        return await this.usersRepository.findUserById(id);
    }

    async deleteUserById(id: string): Promise<boolean> {
        return await this.usersRepository.deleteUserById(id);
    }

    async deleteAllUsers(): Promise<void> {
        return await this.usersRepository.clear();
    }

    async checkCredentials(loginOrEmail: string, password: string): Promise<UserDocument | null> {
        const user = await this.usersRepository.findUserByLoginOrEmail(loginOrEmail);
        if (!user) return null;
        const passwordHash = await this._generateHash(password, user.accountData.salt);
        if (user.accountData.hash !== passwordHash) {
            return null;
        } else {
            return user;
        }
    }

    async _generateHash(password: string, salt: string) {
        return await bcrypt.hash(password, salt);
    }
}
