import { Injectable } from '@nestjs/common';
import { SessionsRepository } from '../04-repositories/sessions-repository';
import { JwtService, RefreshTokenInfoType } from '../../../application/adapters/jwt/jwt-service';
import { AuthSession } from '../03-domain/session-model';
import { SessionsQueryRepository } from '../04-repositories/sessions-query-repository';

@Injectable()
export class SessionService {
    constructor(
        private sessionsRepository: SessionsRepository,
        private sessionsQueryRepository: SessionsQueryRepository,
        private jwtService: JwtService,
    ) {}

    async addSession(
        ip: string,
        deviceId: string,
        deviceName: string | null,
        refreshToken: string,
    ): Promise<AuthSession | null> {
        // достанем нужную для сессии инфу из Рефреш-токена:
        const refreshTokenInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(refreshToken);
        if (!refreshTokenInfo) return null;
        const refreshTokenIssuedAt: Date = new Date(refreshTokenInfo.iat);
        const refreshTokenExpiresAt: Date = new Date(refreshTokenInfo.exp);
        const userId: string = refreshTokenInfo.userId;

        // сохраним сессию:
        const session: AuthSession = {
            ip,
            title: 'title mock',
            deviceId,
            deviceName,
            refreshTokenIssuedAt,
            refreshTokenExpiresAt,
            userId,
        };
        await this.sessionsRepository.addSession(session);
        return session;
    }

    async updateSession(
        currentIp: string,
        deviceId: string,
        refreshToken: string,
        currentSession: AuthSession,
    ): Promise<AuthSession | null> {
        const refreshTokenInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(refreshToken);
        if (!refreshTokenInfo) return null;
        const refreshTokenIssuedAt: Date = new Date(refreshTokenInfo.iat);
        const refreshTokenExpiresAt: Date = new Date(refreshTokenInfo.exp);

        // компонуем обновленную сессию:
        const session: AuthSession = {
            ...currentSession,
            ip: currentIp,
            deviceId,
            refreshTokenIssuedAt,
            refreshTokenExpiresAt,
        };
        try {
            await this.sessionsRepository.updateSession(deviceId, session);
        } catch (e) {
            console.log(e);
            return null;
        }
        return session;
    }

    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        return await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
    }

    async deleteAllSessionsExcludeCurrent(currentUserId: string, currentDeviceId: string): Promise<boolean> {
        return await this.sessionsRepository.deleteAllSessionsExcludeCurrent(currentUserId, currentDeviceId);
    }

    async deleteAllSessions(): Promise<void> {
        await this.sessionsRepository.deleteAllSessions();
    }
}
