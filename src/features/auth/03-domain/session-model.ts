import { ObjectId } from 'mongodb';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Blog } from '../../blogs/03-domain/blog-db-model';

export type IpType = string | string[];

export type SessionViewModel = {
    ip: string;
    title: string;
    lastActiveDate: string;
    deviceId: string;
};

export type SessionDocument = HydratedDocument<Blog>;
@Schema()
export class AuthSession {
    // @Prop({ type: string | string[] })
    @Prop({ required: true })
    ip: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    deviceId: string;

    @Prop({ required: true })
    deviceName: string;

    @Prop({ required: true })
    refreshTokenIssuedAt: Date;

    @Prop({ required: true })
    refreshTokenExpiresAt: Date;

    @Prop({ required: true })
    userId: string;
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);
