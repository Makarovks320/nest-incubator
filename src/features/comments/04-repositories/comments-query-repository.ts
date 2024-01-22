import { WithPagination } from '../../../application/types/types';
import { CommentViewModel } from '../01-api/models/output-models/CommentViewModel';
import { Injectable } from '@nestjs/common';
import { CommentQueryParams } from '../types/comment-query-params-type';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument } from '../03-domain/comment-db-model';
import { Model } from 'mongoose';
import { CommentsDataMapper } from '../01-api/comments-data-mapper';

export const WITHOUT_v_MONGOOSE_PROJECTION = { __v: 0 };
export const COMMENT_PROJECTION = { ...WITHOUT_v_MONGOOSE_PROJECTION, postId: false };
@Injectable()
export class CommentsQueryRepository {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        private commentsDataMapper: CommentsDataMapper,
    ) {}
    async getCommentsForPost(
        postId: string,
        queryParams: CommentQueryParams,
        userId: string,
    ): Promise<WithPagination<CommentViewModel>> {
        const sort: Record<string, -1 | 1> = {};
        if (queryParams.sortBy) {
            sort[queryParams.sortBy] = queryParams.sortDirection === 'asc' ? 1 : -1;
        }
        const foundComments: CommentDocument[] = await this.commentModel
            .find({ postId })
            .select(COMMENT_PROJECTION)
            .lean()
            .sort(sort)
            .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
            .limit(queryParams.pageSize);
        const totalCount = await this.commentModel.countDocuments({ postId });

        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount: totalCount,
            items: foundComments.map(c => this.commentsDataMapper.getCommentViewModel(c, userId)),
        };
    }
    async getCommentById(commentId: string): Promise<Comment | null> {
        return this.commentModel.findOne({ _id: commentId }).select(COMMENT_PROJECTION).lean();
    }
    async getCommentViewModel(commentId: string, userId: string): Promise<CommentViewModel | null> {
        const commentFromDb = await this.commentModel.findOne({ _id: commentId }).select(COMMENT_PROJECTION).lean();
        if (!commentFromDb) return null;
        return this.commentsDataMapper.getCommentViewModel(commentFromDb, userId);
    }
}
