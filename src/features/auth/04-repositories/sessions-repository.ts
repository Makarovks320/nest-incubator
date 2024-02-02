import { Injectable } from '@nestjs/common';
import { AuthSession, SessionModel } from '../03-domain/session-model';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';

@Injectable()
export class SessionsRepository {
    constructor(@InjectModel(AuthSession.name) private sessionModel: SessionModel) {}
    async addSession(session: AuthSession): Promise<AuthSession | null> {
        try {
            await this.sessionModel.insertMany(session);
        } catch (e) {
            console.log(e);
            return null;
        }
        return session;
    }
    async updateSession(deviceId: string, session: AuthSession): Promise<boolean> {
        const result = await this.sessionModel.updateOne({ deviceId }, session);
        return result.modifiedCount === 1;
    }
    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const result = await this.sessionModel.deleteOne({ deviceId });
        return result.deletedCount === 1;
    }
    async deleteAllSessions(): Promise<boolean> {
        try {
            await this.sessionModel.deleteMany();
        } catch (e) {
            console.log(e);
            return false;
        }
        return true;
    }
    async deleteAllSessionsExcludeCurrent(currentUserId: string, currentDeviceId: string): Promise<boolean> {
        // удалим все сессии для текущего юзера, кроме сессии с текущим deviceId
        const result: DeleteResult = await this.sessionModel.deleteMany({
            $and: [{ userId: currentUserId }, { deviceId: { $not: { $eq: currentDeviceId } } }],
        });
        return result.deletedCount > 0;
    }
}
