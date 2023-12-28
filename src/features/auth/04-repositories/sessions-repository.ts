import {ObjectId} from "mongodb";
import { Model, MongooseError } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Session, SessionDocument } from '../03-domain/session-model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class SessionsRepository {
    constructor(@InjectModel(Session.name) private sessionModel: Model<SessionDocument>) {}
    async addSession(session: Session): Promise<Session | null> {
        try {
            await this.sessionModel.insertMany(session);
        } catch (e) {
            console.log(e);
            return null;
        }
        return session;
    }
    async getAllSessionsForUser(userId: ObjectId): Promise<Session[] | string> {
        try {
        const sessions: Session[] = await this.sessionModel.find({userId}).lean();
        return sessions;
        } catch (e) {
            if (e instanceof MongooseError) return e.message;
            return 'Mongoose Error'
        }
    }
    async getSessionForDevice(deviceId: string): Promise<Session | null> {
        const session: Session | null = await this.sessionModel.findOne({deviceId});
        return session;
    }
    async updateSession(deviceId: string, session: Session): Promise<boolean> {
        const result = await this.sessionModel.updateOne({deviceId}, session);
        return result.matchedCount === 1;
    }
    async deleteSessionByDeviceId(deviceId: string): Promise<boolean> {
        const result = await this.sessionModel.deleteOne({deviceId});
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
    async deleteAllSessionsExcludeCurrent(currentUserId: ObjectId, currentDeviceId: string) {
        // удалим все сессии для текущего юзера, кроме сессии с текущим deviceId
        await this.sessionModel.deleteMany({
            $and: [
                {userId: currentUserId},
                {deviceId: {$not: {$eq: currentDeviceId}}}
            ]
        });
    }
}
