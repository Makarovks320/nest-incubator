import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';
import { CreatePostModel} from "../types/create-post-input-type";

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
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ default: false })
  blogId: string;
  @Prop({ default: false })
  blogName: string;
  @Prop({ required: true })
  createdAt: Date;

  static createPost(post: CreatePostModel): Post {
      return new this(post);
  }

}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {};

PostSchema.statics = {
    createPost: Post.createPost,
};

