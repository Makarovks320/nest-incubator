import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../features/users/04-repositories/users-repository';
import { ApiValidationException } from '../exception-filters/exceptions/ApiValidationException';

@Injectable()
export class LoginOrEmailExistenceGuard implements CanActivate {
    constructor(private usersRepository: UsersRepository) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userByEmail = await this.usersRepository.findUserByLoginOrEmail(request.body.email);
        if (userByEmail) {
            throw new ApiValidationException([
                { field: 'email', message: 'Incorrect user email: email already exists' },
            ]);
        }
        const userByLogin = await this.usersRepository.findUserByLoginOrEmail(request.body.login);
        if (userByLogin) {
            throw new ApiValidationException([
                { field: 'login', message: 'Incorrect user login: login already exists' },
            ]);
        }
        return true;
    }
}
