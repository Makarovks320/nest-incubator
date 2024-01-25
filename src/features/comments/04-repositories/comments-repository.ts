import { Injectable } from '@nestjs/common';
import { Comment, CommentDocument } from '../03-domain/comment-db-model';
import { CommentViewModel } from '../01-api/models/output-models/CommentViewModel';
import { CommentsDataMapper } from '../01-api/comments-data-mapper';
import { WITHOUT_v_MONGOOSE_PROJECTION } from './comments-query-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class CommentsRepository {
    constructor(
        @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
        private commentsDataMapper: CommentsDataMapper,
    ) {}
    // async createNewComment(comment: CommentDbType): Promise<CommentDbType | string> {
    //     try {
    //         await CommentModel.insertMany(comment);
    //     } catch (e) {
    //         console.log(e);
    //         if (e instanceof MongooseError) return e.message;
    //         return 'Mongoose Error';
    //     }
    //     return comment;
    // }
    //
    // async updateComment(commentId: ObjectId, comment: CommentDbType): Promise<boolean> {
    //         const result = await CommentModel.updateOne({_id: commentId}, comment);
    //         return result.modifiedCount === 1;
    // }
    //
    // async getCommentByIdWithPostId(_id: ObjectId): Promise<CommentDbType | null> {
    //     return CommentModel.findOne({_id})
    //         .select(DEFAULT_MONGOOSE_PROJECTION)
    //         .lean();
    // }
    //
    async findCommentById(commentId: string): Promise<CommentDocument | null> {
        return this.commentModel.findOne({ _id: commentId }).select(WITHOUT_v_MONGOOSE_PROJECTION);
    }
    async deleteCommentById(commentId: string): Promise<boolean> {
        const result = await this.commentModel.deleteOne({ _id: commentId });
        return result.deletedCount === 1;
    }
    //
    // async deleteAllBlogs(): Promise<void> {
    //     await CommentModel.deleteMany({});
    // }

    async save(comment: CommentDocument): Promise<CommentViewModel> {
        await comment.save();
        return this.commentsDataMapper.getCommentViewModel(comment);
    }
    /*
    async save(blog: CreateBlogInputModel): Promise<BlogViewModel> {
        const createdBlog: BlogDocument = new this.blogModel(blog);
        await createdBlog.save();
        return BlogsDataMapper.toBlogView(createdBlog);
    }*/
}
