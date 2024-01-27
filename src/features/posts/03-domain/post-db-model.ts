import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import { CreatePostModel, UpdatePostInputModel } from '../types/create-post-input-type';
import { NewestLikesType } from '../types/post-view-model';
import { LIKE_STATUS_DB_ENUM, LIKE_STATUS_ENUM, LikeStatusType } from '../../likes/03-domain/types';
import { convertDbEnumToLikeStatus } from '../../likes/03-domain/like-status-converters';
import { Like } from '../../likes/03-domain/like-db-model';

export type PostDocument = HydratedDocument<Post>;
export type PostModel = Model<Post> & typeof staticMethods;

const staticMethods = {
    createPost(post: CreatePostModel): Post {
        return new this({ ...post, likesCount: 0, dislikesCount: 0, newestLikes: [] });
    },
};
@Schema({ timestamps: true, statics: staticMethods })
export class Post {
    @Prop({ required: true })
    title: string;
    @Prop({ required: true })
    shortDescription: string;
    @Prop({ required: true })
    content: string;
    @Prop({ default: false })
    blogId: string;
    @Prop({ default: false })
    blogName: string;
    @Prop({ required: true })
    likesCount: number;
    @Prop({ required: true })
    dislikesCount: number;
    @Prop({ required: true, default: [] })
    newestLikes: NewestLikesType[];

    createdAt: Date;

    updatePost(postNewData: UpdatePostInputModel) {
        //todo: нужна проверка, что текущий пользователь владеет блогом, к которому относится пост
        this.title = postNewData.title;
        this.shortDescription = postNewData.shortDescription;
        this.content = postNewData.content;
        this.blogId = postNewData.blogId;
    }
    recalculateLikesCount(
        updateLikeStatus: LikeStatusType,
        previousLikeType: LIKE_STATUS_DB_ENUM = LIKE_STATUS_DB_ENUM.NONE,
    ) {
        // если нет смысла менять
        if (convertDbEnumToLikeStatus(previousLikeType) === updateLikeStatus) return;

        //уменьшаем количество лайков или дизлайков
        if (previousLikeType === LIKE_STATUS_DB_ENUM.LIKE) this.likesCount--;
        if (previousLikeType === LIKE_STATUS_DB_ENUM.DISLIKE) this.dislikesCount--;
        // увеличиваем количество лайков или дизлайков
        if (updateLikeStatus === LIKE_STATUS_ENUM.LIKE) this.likesCount++;
        if (updateLikeStatus === LIKE_STATUS_ENUM.DISLIKE) this.dislikesCount++;
    }
    insertNewLikeToList(updatedAt: Date, userId: string, userLogin: string) {
        const newLike: NewestLikesType = {
            addedAt: updatedAt.toISOString(),
            userId: userId,
            login: userLogin,
        };
        this.newestLikes.unshift(newLike);
        if (this.newestLikes.length === 4) this.newestLikes.splice(-1, 1);
    }
    extractLikeFromList(previousLike: Like): void {
        this.newestLikes = this.newestLikes.filter(l => previousLike.user_id !== l.userId);
    }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
    updatePost: Post.prototype.updatePost,
    recalculateLikesCount: Post.prototype.recalculateLikesCount,
    insertNewLikeToList: Post.prototype.insertNewLikeToList,
    extractLikeFromList: Post.prototype.extractLikeFromList,
};
