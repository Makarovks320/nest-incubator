import {UpdateResult} from 'mongodb';
import {Injectable} from '@nestjs/common';
import {InjectModel} from "@nestjs/mongoose";
import {Model, MongooseError} from "mongoose";
import {Post, PostDocument} from "../03-domain/post-db-model";
import {PostsDataMapper} from "../01-api/posts-data-mapper";
import {PostViewModel} from "../types/post-view-model";

@Injectable()
export class PostsRepository {
    constructor(
        @InjectModel(Post.name) private postModel: Model<PostDocument>,
    ) {
    }
    async findPostById(_id: string): Promise<PostDocument | null> {
    return this.postModel.findOne({_id});
}
//     async createNewPost(p: PostDBType): Promise<PostDBType | string> {
//     try {
//         await PostModel.insertMany(p);
//         return p;
//     } catch (e) {
//         console.log(e);
//         if (e instanceof MongooseError) return e.message;
//         return 'Mongoose Error';
//     }
// }
//     async updatePostById(_id: ObjectId, post: InputPost): Promise<boolean> {
//     const result = await PostModel.updateOne({_id}, post);
//     return result.matchedCount === 1;
//
// }
//     async deleteAllPosts(): Promise<void> {
//     await PostModel.deleteMany({});
// }
//     async deletePostById(_id: ObjectId): Promise<boolean> {
//     const result = await PostModel.deleteOne({_id});
//     return result.deletedCount === 1
// }
    async save(post: Post): Promise<PostViewModel> {
        const createdPost: PostDocument = new this.postModel(post);
        await createdPost.save();
        return PostsDataMapper.toPostView(createdPost);
}
}