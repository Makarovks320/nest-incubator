import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfoType, DbLikesInfoType, LikeForCommentType } from './types';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { LIKE_STATUS_DB_ENUM, LIKE_STATUS_ENUM, LikeStatusType } from '../../likes/03-domain/types';
import { convertLikeStatusToDbEnum } from '../../likes/03-domain/like-status-converters';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModel = Model<CommentDocument> & typeof staticMethods;

@Schema({ timestamps: true })
export class Comment {
    @Prop({ required: true })
    content: string;

    @Prop({
        type: {
            userId: { type: String, required: true },
            userLogin: { type: String, required: true },
        },
    })
    commentatorInfo: CommentatorInfoType;

    @Prop() //todo: { required: true } - можно ли не писать сюда, а оставить как опцию в поле ниже?
    postId: { type: string; required: true }; //todo: почему где-то string, а где-то ObjectId ? Что лучше?

    @Prop()
    dbLikesInfo: DbLikesInfoType;
}

const staticMethods: any = {
    createComment(dto: CreateCommentDto): CommentDocument {
        const newComment: CommentDocument = new this({
            postId: dto.postId,
            content: dto.content,
            commentatorInfo: {
                userId: dto.userId,
                userLogin: dto.userLogin,
            },
            dbLikesInfo: {
                likesCount: 0,
                dislikesCount: 0,
                likes: [],
            },
        });
        return newComment;
    },
};

export const commentMethods = {
    _findLikeForUser(userId: string): LikeForCommentType | undefined {
        return this.dbLikesInfo.likes.find(l => l.userId.equals(userId));
    },

    _createNewLike(likeStatus: LikeStatusType, userId: string) {
        const reaction: LikeForCommentType = {
            userId,
            likeStatus: convertLikeStatusToDbEnum(likeStatus),
        };
        this.dbLikesInfo.likes.push(reaction);
        switch (likeStatus) {
            case LIKE_STATUS_ENUM.LIKE:
                this.dbLikesInfo.likesCount++;
                break;
            case LIKE_STATUS_ENUM.DISLIKE:
                this.dbLikesInfo.dislikesCount++;
                break;
        }
    },

    _changeLike(likeForComment: LikeForCommentType, likeStatus: LIKE_STATUS_DB_ENUM) {
        // если нет смысла менять
        if (likeForComment.likeStatus === likeStatus) return;

        //уменьшаем количество лайков или дизлайков
        if (likeForComment.likeStatus === LIKE_STATUS_DB_ENUM.LIKE) this.dbLikesInfo.likesCount--;
        if (likeForComment.likeStatus === LIKE_STATUS_DB_ENUM.DISLIKE) this.dbLikesInfo.dislikesCount--;
        // увеличиваем количество лайков или дизлайков
        if (likeStatus === LIKE_STATUS_DB_ENUM.LIKE) this.dbLikesInfo.likesCount++;
        if (likeStatus === LIKE_STATUS_DB_ENUM.DISLIKE) this.dbLikesInfo.dislikesCount++;

        // меняем статус лайка
        likeForComment.likeStatus = likeStatus;
    },

    updateContent(userId: string, content: string) {
        if (this.commentatorInfo.userId.toString() != userId.toString()) {
            throw new Error('Comment does not below to the user');
        }
        this.content = content;
    },

    changeLikeStatusForComment(likeStatus: LikeStatusType, userId: string) {
        // если у коммента есть лайк от текущего пользователя, то изменим его, если нет - создадим
        const currentLike = this._findLikeForUser(userId);
        if (!currentLike) {
            this._createNewLike(likeStatus, userId);
            return;
        }
        this._changeLike(currentLike!, convertLikeStatusToDbEnum(likeStatus));
    },
};
export const CommentSchema = SchemaFactory.createForClass(Comment);
