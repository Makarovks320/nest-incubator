import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentatorInfoType, DbLikesInfoType, LikeForCommentType } from './types';
import { HydratedDocument, Model } from 'mongoose';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { LIKE_STATUS_DB_ENUM, LIKE_STATUS_ENUM, LikeStatusType } from '../../likes/03-domain/types';
import { convertLikeStatusToDbEnum } from '../../likes/03-domain/like-status-converters';
import { CommentatorInfoSchema } from './commentator-info-schema';
import { DbLikesInfoSchema } from './db-likes-info-schema';
import { ResultObject } from '../../../application/result-object/ResultObject';

import { ServiceErrorList } from '../../../application/result-object/ServiceErrorList';

export type CommentDocument = HydratedDocument<Comment>;
export type CommentModel = Model<CommentDocument> & typeof staticMethods;

const staticMethods = {
    //todo: разве асинхронность нужна?
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

    changeCommentContent(userId: string, content: string, result: ResultObject): ResultObject {
        this.checkAccessToComment(userId, result);
        if (result.hasErrors()) return result;
        this.content = content;
        return result;
    }
    checkAccessToComment(userId: string, result: ResultObject): ResultObject {
        if (this.commentatorInfo.userId.toString() != userId.toString()) {
            result.addError({
                errorMessage: "User doesn't own the comment",
                errorCode: ServiceErrorList.COMMENT_ACCESS_DENIED,
            });
        }
        return result;
    }
    findLikeForUser(userId: string): LikeForCommentType | undefined {
        return this.dbLikesInfo.likes.find(l => l.userId === userId);
    }
    createNewLike(likeStatus: LikeStatusType, userId: string) {
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
    }
    changeLike(likeForComment: LikeForCommentType, likeStatus: LIKE_STATUS_DB_ENUM) {
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
    }
    changeLikeStatusForComment(likeStatus: LikeStatusType, userId: string) {
        // если у коммента есть лайк от текущего пользователя, то изменим его, если нет - создадим
        const currentLike = this.findLikeForUser(userId);
        if (!currentLike) {
            this.createNewLike(likeStatus, userId);
            return;
        }
        this.changeLike(currentLike!, convertLikeStatusToDbEnum(likeStatus));
    }
}

export const CommentSchema = SchemaFactory.createForClass(Comment);

CommentSchema.methods = {
    changeCommentContent: Comment.prototype.changeCommentContent,
    checkAccessToComment: Comment.prototype.checkAccessToComment,
    findLikeForUser: Comment.prototype.findLikeForUser,
    createNewLike: Comment.prototype.createNewLike,
    changeLike: Comment.prototype.changeLike,
    changeLikeStatusForComment: Comment.prototype.changeLikeStatusForComment,
};
