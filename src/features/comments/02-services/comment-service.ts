import { Comment, CommentDocument, CommentModel } from '../03-domain/comment-db-model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/02-services/user-service';
import { UserDocument } from '../../users/03-domain/user-db-model';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { CommentsRepository } from '../04-repositories/comments-repository';
import { CommentsQueryRepository } from '../04-repositories/comments-query-repository';
import { ResultObject } from '../../../application/result-object/ResultObject';
import { LikeStatusType } from '../../likes/03-domain/types';
import { ServiceErrorList } from '../../../application/result-object/ServiceErrorList';
import { CommentViewModel } from '../01-api/models/output-models/CommentViewModel';
import { PostsQueryRepository } from '../../posts/04-repositories/posts-query-repository';
import { CommentsDataMapper } from '../01-api/comments-data-mapper';

@Injectable()
export class CommentService {
    constructor(
        @InjectModel(Comment.name) private commentModel: CommentModel,
        private userService: UserService,
        private commentsRepository: CommentsRepository,
        private commentsQueryRepository: CommentsQueryRepository,
        private postsQueryRepository: PostsQueryRepository,
        private commentsDataMapper: CommentsDataMapper,
    ) {}

    async createNewComment(postId: string, content: string, userId: string): Promise<ResultObject<CommentViewModel>> {
        const result = new ResultObject<CommentViewModel>();

        const user: UserDocument | null = await this.userService.findUserById(userId);
        if (!user) {
            result.addError({ errorCode: ServiceErrorList.USER_NOT_FOUND });
            return result;
        }
        const post = await this.postsQueryRepository.checkPostExists(postId);
        if (!post) {
            result.addError({ errorCode: ServiceErrorList.POST_NOT_FOUND });
            return result;
        }

        const commentDto: CreateCommentDto = {
            postId: postId,
            content: content,
            userId: userId,
            userLogin: user.login,
        };
        const comment: CommentDocument = await this.commentModel.createComment(commentDto);
        await this.commentsRepository.save(comment);
        result.setData(this.commentsDataMapper.getCommentViewModel(comment, userId));

        return result;
    }

    async updateComment(content: string, commentId: string, userId: string): Promise<ResultObject> {
        const result = new ResultObject();
        const comment: CommentDocument | null = await this.commentsRepository.findCommentById(commentId);
        if (!comment) {
            result.addError({ errorCode: ServiceErrorList.COMMENT_NOT_FOUND });
            return result; // здесь можно генерировать new ResultObject({errorCode: ....})
        }
        comment.changeCommentContent(userId, content, result);
        if (result.hasErrors()) return result;
        await this.commentsRepository.save(comment);
        return result;
    }

    async changeLikeStatus(commentId: string, likeStatus: LikeStatusType, userId: string): Promise<ResultObject> {
        const result = new ResultObject();
        const comment: CommentDocument | null = await this.commentsRepository.findCommentById(commentId);
        if (!comment) {
            result.addError({ errorCode: ServiceErrorList.COMMENT_NOT_FOUND });
            return result;
        }
        comment.changeLikeStatusForComment(likeStatus, userId);
        await this.commentsRepository.save(comment);

        return result;
    }

    async deleteCommentById(commentId: string, userId: string): Promise<ResultObject> {
        const result = new ResultObject();

        const comment: Comment | null = await this.commentsQueryRepository.getCommentById(commentId);
        if (!comment) {
            result.addError({ errorCode: ServiceErrorList.COMMENT_NOT_FOUND });
            return result;
        }

        const user: UserDocument | null = await this.userService.findUserById(userId);
        if (!user || comment!.commentatorInfo.userLogin != user.login) {
            result.addError({
                errorMessage: "User doesn't own the comment",
                errorCode: ServiceErrorList.COMMENT_ACCESS_DENIED,
            });
            return result;
        }
        const isDeleted = await this.commentsRepository.deleteCommentById(commentId);

        if (!isDeleted) {
            result.addError({ errorCode: ServiceErrorList.COMMENT_DELETE_ERROR });
            return result;
        }
        return result;
    }
}
