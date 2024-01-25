import { ObjectId } from 'mongodb';
import { LIKE_STATUS_DB_ENUM, PARENT_TYPE_DB_ENUM } from './types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;
export type LikeModel = Model<LikeDocument>;

@Schema({ timestamps: true })
export class Like {
    @Prop({ required: true })
    parent_type: PARENT_TYPE_DB_ENUM;

    @Prop({ required: true })
    parent_id: ObjectId;

    @Prop({ required: true })
    type: LIKE_STATUS_DB_ENUM;

    @Prop({ required: true })
    user_id: ObjectId;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
