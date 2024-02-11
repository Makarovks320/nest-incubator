import { Injectable } from '@nestjs/common';
import { AuthTokenPair, JwtService, RefreshTokenInfoType } from '../../../../application/adapters/jwt/jwt-service';
import { AuthSession } from '../../03-domain/session-model';
import { SessionsQueryRepository } from '../../04-repositories/sessions-query-repository';
import { SessionService } from '../session-service';

@Injectable()
export class RefreshTokenUseCase {
    constructor(
        private jwtService: JwtService,
        private sessionService: SessionService,
        private sessionsQueryRepository: SessionsQueryRepository,
    ) {}

    async execute(userId: string, ip: string, currentRefreshToken: string): Promise<AuthTokenPair | null> {
        // из старого токена вытащим deviceId:
        const currentRTInfo: RefreshTokenInfoType | null =
            await this.jwtService.getRefreshTokenInfo(currentRefreshToken);
        const deviceId: string = currentRTInfo!.deviceId;

        // теперь создадим новую пару токенов:
        const accessToken: string = await this.jwtService.createAccessToken(userId);
        const newRefreshToken = await this.jwtService.createRefreshToken(userId, deviceId);

        // Получим информацию о текущей сессии:
        const currentSession: AuthSession | null = await this.sessionsQueryRepository.getAuthSessionForDevice(deviceId);
        if (!currentSession) {
            return null;
        }

        const session = await this.sessionService.updateSession(ip, deviceId, newRefreshToken, currentSession);
        if (!session) return null;

        return {
            accessToken,
            refreshToken: newRefreshToken,
        };
    }
}
