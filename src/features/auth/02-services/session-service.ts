import {IpType, SessionDbModel} from "../models/session/session-model";
import {SessionsRepository} from "../repositories/sessions-repository";
import {ObjectId} from "mongodb";
import {JwtService, RefreshTokenInfoType} from "../application/jwt-service";
import {inject, injectable} from "inversify";

@injectable()
export class SessionService {
    constructor(
        @inject(SessionsRepository) private sessionsRepository: SessionsRepository,
        @inject(JwtService) private jwtService: JwtService
    ) {
    }

    async addSession(ip: IpType, deviceId: string, deviceName: string, refreshToken: string)
        : Promise<SessionDbModel | null> {
        // достанем нужную для сессии инфу из Рефреш-токена:
        const refreshTokenInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(refreshToken);
        if (!refreshTokenInfo) return null;
        const refreshTokenIssuedAt: Date = new Date(refreshTokenInfo.iat);
        const refreshTokenExpiresAt: Date = new Date(refreshTokenInfo.exp);
        const userId: ObjectId = refreshTokenInfo.userId

        // сохраним сессию:
        const session: SessionDbModel = {
            _id: new ObjectId(),
            ip,
            title: 'title mock',
            deviceId,
            deviceName,
            refreshTokenIssuedAt,
            refreshTokenExpiresAt,
            userId
        }
        await this.sessionsRepository.addSession(session);
        return session;
    }

    async getAllSessionsForUser(userId: ObjectId): Promise<SessionDbModel[] | string> {
        return await this.sessionsRepository.getAllSessionsForUser(userId);
    }

    async getSessionForDevice(deviceId: string): Promise<SessionDbModel | null> {
        return await this.sessionsRepository.getSessionForDevice(deviceId);
    }

    async updateSession(currentIp: IpType, deviceId: string, refreshToken: string, currentSession: SessionDbModel)
        : Promise<SessionDbModel | null> {
        const refreshTokenInfo: RefreshTokenInfoType | null = await this.jwtService.getRefreshTokenInfo(refreshToken);
        if (!refreshTokenInfo) return null;
        const refreshTokenIssuedAt: Date = new Date(refreshTokenInfo.iat);
        const refreshTokenExpiresAt: Date = new Date(refreshTokenInfo.exp);

        // компонуем обновленную сессию:
        const session: SessionDbModel = {
            ...currentSession,
            ip: currentIp,
            deviceId,
            refreshTokenIssuedAt,
            refreshTokenExpiresAt
        }
        try {
            await this.sessionsRepository.updateSession(deviceId, session);
        } catch (e) {
            console.log(e);
            return null;
        }
        return session;
    }

    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const result = await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
        return result;
    }

    async deleteAllSessionsExcludeCurrent(currentUserId: ObjectId, currentDeviceId: string) {
        await this.sessionsRepository.deleteAllSessionsExcludeCurrent(currentUserId, currentDeviceId);
    }

    async deleteAllSessions(): Promise<void> {
        await this.sessionsRepository.deleteAllSessions();
    }
}
