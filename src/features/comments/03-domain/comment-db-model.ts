import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfoType, DbLikesInfoType, LikeForCommentType } from './types';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { LIKE_STATUS_DB_ENUM, LIKE_STATUS_ENUM, LikeStatusType } from '../../likes/03-domain/types';
import { convertLikeStatusToDbEnum } from '../../likes/03-domain/like-status-converters';
import { CommentatorInfoSchema } from './commentator-info-schema';
import { DbLikesInfoSchema } from './db-likes-info-schema';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModel = Model<CommentDocument> & typeof staticMethods;

const staticMethods = {
    async createComment(dto: CreateCommentDto): Promise<CommentDocument> {
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
@Schema({ timestamps: true, statics: staticMethods })
export class Comment {
    @Prop({ required: true })
    content: string;

    @Prop({ required: true, type: CommentatorInfoSchema })
    commentatorInfo: CommentatorInfoType;

    @Prop({ required: true })
    postId: string;

    @Prop({ required: true, type: DbLikesInfoSchema })
    dbLikesInfo: DbLikesInfoType;

    createdAt: Date;

    updateComment(userId: string, content: string) {
        if (this.commentatorInfo.userId.toString() != userId.toString()) {
            throw new Error('Comment does not below to the user'); //todo result object || custom error
        }
        this.content = content;
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
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

    updateComment: Comment.prototype.updateComment,

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
