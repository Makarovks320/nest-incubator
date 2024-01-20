import { Prop, Schema } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';
import { CommentatorInfoType } from './types';

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true })
    content: string;

    @Prop({
        type: {
            userId: { type: ObjectId, required: true },
            userLogin: { type: String, required: true },
        },
    })
    commentatorInfo: CommentatorInfoType;

    @Prop()
    postId: { type: string; required: true };

    // @Prop()
    // dbLikesInfo: DbLikesInfoType
}
