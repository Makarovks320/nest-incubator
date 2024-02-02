import { AuthSession, SessionViewModel } from '../03-domain/session-model';
import { AuthSessionInfoType } from '../05-dto/AuthSessionInfoType';

export class AuthDataMapper {
    static getSessionViewModel(session: AuthSession): SessionViewModel {
        return {
            ip: session.ip,
            title: session.title,
            lastActiveDate: session.refreshTokenIssuedAt.toISOString(),
            deviceId: session.deviceId,
        };
    }
    static getSessionRefreshTokenIssuedAt(session: AuthSession): Date {
        return session.refreshTokenIssuedAt;
    }
    static getSessionsListViewModel(sessions: AuthSession[]): SessionViewModel[] {
        return sessions.map(session => AuthDataMapper.getSessionViewModel(session));
    }
    static getSessionUserIdAndDeviceId(session: AuthSession): AuthSessionInfoType {
        return {
            userId: session.userId,
            deviceId: session.deviceId,
        };
    }
}
