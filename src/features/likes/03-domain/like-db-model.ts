import { ObjectId } from 'mongodb';
import { LIKE_STATUS_DB_ENUM, PARENT_TYPE_DB_ENUM } from './types';
import { Prop, Schema } from '@nestjs/mongoose';

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
    // constructor(
    //     public _id: ObjectId,
    //     public parent_type: PARENT_TYPE_DB_ENUM,
    //     public parent_id: ObjectId,
    //     public type: LIKE_STATUS_DB_ENUM,
    //     public user_id: ObjectId,
    //     public createdAt: Date,
    //     public updatedAt: Date,
    // ) {}
}
