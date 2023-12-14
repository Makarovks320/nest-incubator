import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
import {CreatePostModel, UpdatePostInputModel} from "../types/create-post-input-type";

export type PostDocument = HydratedDocument<Post>;

@Schema()
export class Post {
    constructor(inputPost: CreatePostModel) {
        this.title = inputPost.title;
        this.shortDescription = inputPost.shortDescription;
        this.content = inputPost.content;
        this.blogId = inputPost.blogId;
        this.blogName = inputPost.blogName;
        this.createdAt = new Date();
    }

    @Prop({required: true})
    title: string;
    @Prop({required: true})
    shortDescription: string;
    @Prop({required: true})
    content: string;
    @Prop({default: false})
    blogId: string;
    @Prop({default: false})
    blogName: string;
    @Prop({required: true})
    createdAt: Date;

    static createPost(post: CreatePostModel): Post {
        return new this(post);
    }

    updatePost(postNewData: UpdatePostInputModel) {
        //todo: нужна проверка, что текущий пользователь владеет блогом, к которому относится пост
        this.title = postNewData.title;
        this.shortDescription = postNewData.shortDescription;
        this.content = postNewData.content;
        this.blogId = postNewData.blogId;
        this.blogName = postNewData.blogName;
    }

}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
    updatePost: Post.prototype.updatePost
};

PostSchema.statics = {
    createPost: Post.createPost,
};

