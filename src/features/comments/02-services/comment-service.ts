import { Comment, CommentDocument, CommentModel } from '../03-domain/comment-db-model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { UserService } from '../../users/02-services/user-service';
import { UserDocument } from '../../users/03-domain/user-db-model';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { CommentsRepository } from '../04-repositories/comments-repository';
import { CommentViewModel } from '../01-api/models/output-models/CommentViewModel';

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
        comment.updateContent(userId, content); //todo: fix error
        await this.commentsRepository.save(comment);
    }
    //
    // async changeLikeStatus(commentId: string, likeStatus: LikeStatusType, userId: string): Promise<void> {
    //     const comment: CommentDocument | null = await this.commentsRepository.findCommentById(commentId);
    //     comment.changeLikeStatusForComment(likeStatus, userId);
    //     await this.commentsRepository.save(comment);
    // }
    //
    // async deleteCommentById(commentId: string): Promise<boolean> {
    //     return this.commentsRepository.deleteCommentById(commentId);
    // }
}
