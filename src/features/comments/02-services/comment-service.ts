import { Comment, CommentDocument, CommentModel } from '../03-domain/comment-db-model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../../users/02-services/user-service';
import { UserDocument } from '../../users/03-domain/user-db-model';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { CommentsRepository } from '../04-repositories/comments-repository';
import { CommentViewModel } from '../01-api/models/output-models/CommentViewModel';
import { CommentsQueryRepository } from '../04-repositories/comments-query-repository';
import { ResultObject } from '../../../application/result-object/ResultObject';

export type InputCommentWithPostId = {
    content: string;
    postId: string;
};

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: CommentModel,
        private userService: UserService,
        private commentsRepository: CommentsRepository,
        private commentsQueryRepository: CommentsQueryRepository,
    ) {}

    async createNewComment(postId: string, content: string, userId: string): Promise<CommentViewModel> {
        // найдем userLogin
        const user: UserDocument | null = await this.userService.findUserById(userId);
        if (!user) throw new Error('user is not found');

        const commentDto: CreateCommentDto = {
            postId: postId,
            content: content,
            userId: userId,
            userLogin: user.login,
        };
        const comment: CommentDocument = await this.commentModel.createComment(commentDto);
        return await this.commentsRepository.save(comment);
    }

    async updateComment(content: string, commentId: string, userId: string): Promise<void> {
        const comment: CommentDocument | null = await this.commentsRepository.findCommentById(commentId);
        if (!comment) throw new InternalServerErrorException();
        comment.changeCommentContent(userId, content);
        await this.commentsRepository.save(comment);
    }
    //
    // async changeLikeStatus(commentId: string, likeStatus: LikeStatusType, userId: string): Promise<void> {
    //     const comment: CommentDocument | null = await this.commentsRepository.findCommentById(commentId);
    //     comment.changeLikeStatusForComment(likeStatus, userId);
    //     await this.commentsRepository.save(comment);
    // }

    async deleteCommentById(commentId: string, userId: string): Promise<ResultObject> {
        const result = new ResultObject();

        const comment: Comment | null = await this.commentsQueryRepository.getCommentById(commentId);
        if (!comment) {
            result.addError({ errorCode: CommentServiceError.COMMENT_NOT_FOUND });
            return result;
        }

        const user: UserDocument | null = await this.userService.findUserById(userId);
        if (!user || comment!.commentatorInfo.userLogin != user.login) {
            result.addError({
                errorMessage: "User doesn't own the comment",
                errorCode: CommentServiceError.COMMENT_ACCESS_DENIED,
            });
            return result;
        }
        const isDeleted = await this.commentsRepository.deleteCommentById(commentId);

        if (!isDeleted) {
            result.addError({ errorCode: CommentServiceError.COMMENT_DELETE_ERROR });
            return result;
        }
        return result;
    }
}

export enum CommentServiceError {
    COMMENT_NOT_FOUND,
    COMMENT_ACCESS_DENIED,
    COMMENT_DELETE_ERROR,
}
