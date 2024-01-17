import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { appConfig } from '../../config';
import { ObjectId } from 'mongodb';

export type RefreshTokenInfoType = {
    deviceId: string;
    userId: string;
    iat: number;
    exp: number;
};

@Injectable()
export class JwtService {
    secret: string = appConfig.JWT_SECRET;
    refreshSecret: string = appConfig.JWT_REFRESH_SECRET;

    async createAccessToken(userId: string) {
        return jwt.sign({ userId }, this.secret, { expiresIn: '600s' });
    }

    async createRefreshToken(userId: string, deviceId: string) {
        return jwt.sign({ userId, deviceId }, this.refreshSecret, { expiresIn: '1200s' });
    }

    async getUserIdByToken(token: string): Promise<string | null> {
        try {
            const result: any = await jwt.verify(token, this.secret);
            // todo: обсудить, почему создаем userId как ObjectId, а возвращается string.
            // todo: почему verify возвращает result.userId как строку? хотя получал ObjectId
            const userId = result.userId;
            return userId;
        } catch (e) {
            return null;
        }
    }

    async getRefreshTokenInfo(refreshToken: string): Promise<RefreshTokenInfoType | null> {
        try {
            const result: any = await jwt.verify(refreshToken, this.refreshSecret);
            return {
                deviceId: result.deviceId,
                iat: result.iat * 1000,
                exp: result.exp * 1000,
                userId: result.userId,
            };
        } catch (e) {
            return null;
        }
    }
}
