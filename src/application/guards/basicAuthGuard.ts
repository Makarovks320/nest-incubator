import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        // закодируем верные логин и пароль для дальнейшей проверки
        const coded = Buffer.from('admin:qwerty').toString('base64');
        if (request.headers.authorization === `Basic ${coded}`) return true;
        throw new UnauthorizedException();
    }
}
