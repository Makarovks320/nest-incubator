import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../features/users/04-repositories/users-repository';
import { ApiValidationError } from '../errors/ApiValidationError';

@Injectable()
export class loginOrEmailExistenceGuard implements CanActivate {
    constructor(private usersRepository: UsersRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userByEmail = await this.usersRepository.findUserByLoginOrEmail(request.body.email);
        if (userByEmail) {
            throw new ApiValidationError([{ field: 'email', message: 'Incorrect user email: email already exists' }]);
        }
        const userByLogin = await this.usersRepository.findUserByLoginOrEmail(request.body.login);
        if (userByLogin) {
            throw new ApiValidationError([{ field: 'login', message: 'Incorrect user login: login already exists' }]);
        }
        return true;
    }
}
