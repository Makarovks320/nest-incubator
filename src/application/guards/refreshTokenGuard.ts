import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, RefreshTokenInfoType } from '../adapters/jwt-service';
import { UserService } from '../../features/users/02-services/user-service';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = request.cookies.refreshToken;
        if (!token) {
            throw new UnauthorizedException();
        }

        const refreshTokenInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(token);
        if (!refreshTokenInfo) {
            throw new UnauthorizedException();
        }

        const user = await this.userService.findUserById(refreshTokenInfo.userId);
        if (user) {
            request.userId = refreshTokenInfo.userId;
            return true;
        }
        throw new UnauthorizedException();
    }
}
