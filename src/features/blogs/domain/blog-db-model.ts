import { BlogDBDto, CreateBlogInputDto } from '../types/dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;
@Schema(
    // {timestamps: true}
)
export class Blog {
  // constructor(input: CreateBlogInputDto) {
  //   this.name = input.name;
  //   this.description = input.description;
  //   this.websiteUrl = input.websiteUrl;
  // }

  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ default: false })
  isMembership: boolean;

  // createdAt: Date;

  // static createBlog(input: CreateBlogInputDto) {
  //   return new this(input);
  // }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
//
// BlogSchema.methods = {};
//
// BlogSchema.statics = {
//   createBlog: Blog.createBlog,
// };

