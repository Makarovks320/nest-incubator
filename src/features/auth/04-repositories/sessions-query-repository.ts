import { Injectable } from '@nestjs/common';
import { AuthSession, SessionModel } from '../03-domain/session-model';
import { InjectModel } from '@nestjs/mongoose';

type SessionMapperType<T> = (session: AuthSession) => T;
type SessionsListMapperType<T> = (sessions: AuthSession[]) => T[];
@Injectable()
export class SessionsQueryRepository {
    constructor(@InjectModel(AuthSession.name) private sessionModel: SessionModel) {}
    async getAllSessionsForUser<T>(userId: string, mapper: SessionsListMapperType<T>): Promise<T[]> {
        const sessions: AuthSession[] = await this.sessionModel.find({ userId }).lean();
        return mapper(sessions);
    }
    async getSessionForDevice<T>(deviceId: string, mapper: SessionMapperType<T>): Promise<T | null> {
        const session: AuthSession | null = await this.sessionModel.findOne({ deviceId }).lean();
        if (session) {
            return mapper(session);
        }
        return null;
    }
    async getAuthSessionForDevice(deviceId: string): Promise<AuthSession | null> {
        const session: AuthSession | null = await this.sessionModel.findOne({ deviceId }).lean();
        return session;
    }
}
