import { Comment, CommentDocument, CommentModel } from '../03-domain/comment-db-model';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/02-services/user-service';
import { UserDocument } from '../../users/03-domain/user-db-model';
import { CreateCommentDto } from '../05-dto/CreateCommentDto';
import { CommentsRepository } from '../04-repositories/comments-repository';

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

    async createNewComment(postId: string, content: string, userId: string): Promise<CommentDocument> {
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
        await this.commentsRepository.save(comment);
        return comment;
    }

    // async updateComment(content: string, commentId: string, userId: string): Promise<void> {
    //     const comment: CommentDocument | null = await this.commentsRepository.findCommentById(commentId);
    //     comment.updateContent(userId, content);
    //     await this.commentsRepository.save(comment);
    // }
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
