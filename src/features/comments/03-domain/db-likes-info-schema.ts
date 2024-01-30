import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LIKE_STATUS_DB_ENUM } from '../../likes/03-domain/types';

@Schema()
export class LikeInfo {
    @Prop({ type: String, required: true })
    userId: string;

    @Prop({
        type: Number,
        enum: [LIKE_STATUS_DB_ENUM.LIKE, LIKE_STATUS_DB_ENUM.DISLIKE, LIKE_STATUS_DB_ENUM.NONE],
        required: true,
    })
    likeStatus: number;
}

@Schema()
class DbLikesInfo {
    @Prop({ required: true })
    likesCount: number;

    @Prop({ required: true })
    dislikesCount: number;

    @Prop({ type: [LikeInfo], required: true, default: [] })
    likes: LikeInfo[];
}

export const DbLikesInfoSchema = SchemaFactory.createForClass(DbLikesInfo);
