import { Injectable } from '@nestjs/common';
import { CommentDocument } from '../03-domain/comment-db-model';
import { CommentViewModel } from '../01-api/models/output-models/CommentViewModel';
import { CommentsDataMapper } from '../01-api/comments-data-mapper';

@Injectable()
export class CommentsRepository {
    constructor(private commentsDataMapper: CommentsDataMapper) {}
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
    // async findCommentById(_id: ObjectId | string): Promise<CommentDocument | null> {
    //     return CommentModel.findOne({_id})
    //         .select(WITHOUT_v_MONGOOSE_PROJECTION);
    // }
    // async deleteCommentById(_id: ObjectId): Promise<boolean> {
    //     const result = await CommentModel.deleteOne({_id});
    //     return result.deletedCount === 1;
    // }
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
