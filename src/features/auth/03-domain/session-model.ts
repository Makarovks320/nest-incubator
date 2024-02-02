import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type SessionViewModel = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
};

export type SessionDocument = HydratedDocument<AuthSession>;
export type SessionModel = Model<SessionDocument>;
@Schema()
export class AuthSession {
    @Prop({ required: true })
    ip: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    deviceId: string;

    @Prop({ type: String || null, required: false })
    deviceName: string | null;

    @Prop({ required: true })
    refreshTokenIssuedAt: Date;

    @Prop({ required: true })
    refreshTokenExpiresAt: Date;

    @Prop({ required: true })
    userId: string;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
