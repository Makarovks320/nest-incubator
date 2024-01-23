import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { LIKE_STATUS_DB_ENUM } from '../../likes/03-domain/types';

@Schema()
class DbLikesInfo {
    @Prop({ required: true })
    likesCount: number;

    @Prop({ required: true })
    dislikesCount: number;

    @Prop({ required: true, default: [] })
    likes: [
        {
            type: {
                userId: { type: string; required: true };
                likeStatus: { type: LIKE_STATUS_DB_ENUM; required: true };
            };
        },
    ];
}

export const DbLikesInfoSchema = SchemaFactory.createForClass(DbLikesInfo);
