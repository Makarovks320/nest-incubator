import { BadRequestException, CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersRepository } from '../../features/users/04-repositories/users-repository';

@Injectable()
export class checkLoginOrEmailExistenceGuard implements CanActivate {
    constructor(private usersRepository: UsersRepository) {}
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userByEmail = await this.usersRepository.findUserByLoginOrEmail(request.body.email);
        if (userByEmail) {
            throw new BadRequestException('Incorrect user email: email already exists');
        }
        const userByLogin = await this.usersRepository.findUserByLoginOrEmail(request.body.login);
        if (userByLogin) {
            throw new BadRequestException('Incorrect user login: login already exists');
        }
        return true;
    }
}
