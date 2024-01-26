import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CreatePostModel, UpdatePostInputModel } from '../types/create-post-input-type';
import { NewestLikesType } from '../types/post-view-model';
import { LIKE_STATUS_DB_ENUM, LIKE_STATUS_ENUM, LikeStatusType } from '../../likes/03-domain/types';
import { convertDbEnumToLikeStatus } from '../../likes/03-domain/like-status-converters';
import { Like } from '../../likes/03-domain/like-db-model';

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    //todo: удалить конструктор, если не нужен
    constructor(inputPost: CreatePostModel) {
        this.title = inputPost.title;
        this.shortDescription = inputPost.shortDescription;
        this.content = inputPost.content;
        this.blogId = inputPost.blogId;
        this.blogName = inputPost.blogName;
        this.likesCount = 0;
        this.dislikesCount = 0;
        this.newestLikes = [];
        this.createdAt = new Date();
    }

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
    createdAt: Date;
    @Prop({ required: true })
    likesCount: number;
    @Prop({ required: true })
    dislikesCount: number;
    @Prop({ required: true })
    newestLikes: NewestLikesType[];

    static createPost(post: CreatePostModel): Post {
        return new this(post);
    }

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
};

PostSchema.statics = {
    createPost: Post.createPost,
};
