import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, RefreshTokenInfoType } from '../adapters/jwt/jwt-service';
import { AuthHelper } from '../helpers/auth-helper';
import { SessionService } from '../../features/auth/02-services/session-service';
import { AuthSession } from '../../features/auth/03-domain/session-model';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private authHelper: AuthHelper,
        private sessionService: SessionService,
        private jwtService: JwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();

        const refreshToken = this.authHelper.getRefreshToken(request);
        if (!refreshToken) {
            throw new UnauthorizedException();
        }

        const refreshTokenInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(refreshToken);
        if (!refreshTokenInfo) {
            throw new UnauthorizedException();
        }

        const session: AuthSession | null = await this.sessionService.getSessionForDevice(refreshTokenInfo.deviceId);
        if (!session) {
            throw new UnauthorizedException();
        }

        const inputRefreshTokenIAt = this.jwtService.lastActiveDate(refreshToken).getTime();
        const receivedRefreshTokenIAt = session.refreshTokenIssuedAt.getTime();
        if (inputRefreshTokenIAt !== receivedRefreshTokenIAt) {
            throw new UnauthorizedException();
        }

        request.userId = refreshTokenInfo.userId;
        request.deviceId = refreshTokenInfo.deviceId;
        return true;
    }
}
