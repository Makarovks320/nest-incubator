import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService, RefreshTokenInfoType } from '../adapters/jwt/jwt-service';
import { AuthHelper } from '../helpers/auth-helper';
import { SessionsQueryRepository } from '../../features/auth/04-repositories/sessions-query-repository';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
    constructor(
        private authHelper: AuthHelper,
        private sessionsQueryRepository: SessionsQueryRepository,
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

        const session = await this.sessionsQueryRepository.getAuthSessionForDevice(refreshTokenInfo.deviceId);
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
