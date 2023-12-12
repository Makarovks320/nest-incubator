import { IBlog, CreateBlogInputDto } from '../types/dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;
@Schema()
export class Blog {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ default: false })
  isMembership: boolean;
  @Prop({ required: true })
  createdAt: Date;

  static createBlog(inputBlog: CreateBlogInputDto): IBlog {
    return {
        ...inputBlog,
        isMembership: false,
        createdAt: new Date(),
      };
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {};

BlogSchema.statics = {
  createBlog: Blog.createBlog,
};

