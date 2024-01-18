import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, RefreshTokenInfoType } from '../adapters/jwt/jwt-service';
import { UserService } from '../../features/users/02-services/user-service';
import { AuthHelper } from '../helpers/auth-helper';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private authHelper: AuthHelper,
        private userService: UserService,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const token = this.authHelper.getRefreshToken(request);
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
            request.deviceId = refreshTokenInfo.deviceId;
            return true;
        }
        throw new UnauthorizedException();
    }
}
