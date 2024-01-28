import { LIKE_STATUS_DB_ENUM, PARENT_TYPE_DB_ENUM } from './types';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { UpdateLikeForPostDto } from '../05-dto/UpdateLikeForPostDto';
import { convertLikeStatusToDbEnum } from './like-status-converters';
import { CreateLikeDto } from '../02-services/types/CreateLikeDto';

export type LikeDocument = HydratedDocument<Like>;
export type LikeModel = Model<LikeDocument> & typeof staticMethods;

const staticMethods = {
    createLike(dto: CreateLikeDto): LikeDocument {
        return new this(dto);
    },
};
@Schema({ timestamps: true, statics: staticMethods })
export class Like {
    @Prop({ required: true })
    parent_type: PARENT_TYPE_DB_ENUM;

    @Prop({ required: true })
    parent_id: string;

    @Prop({ required: true })
    like_status: LIKE_STATUS_DB_ENUM;

    @Prop({ required: true })
    user_id: string;

    createdAt: Date;
    updatedAt: Date;
    updateLike(likeNewData: UpdateLikeForPostDto) {
        //todo: нужна проверка, что текущий пользователь владеет блогом, к которому относится пост
        this.like_status = convertLikeStatusToDbEnum(likeNewData.status);
    }
}

export const LikeSchema = SchemaFactory.createForClass(Like);
