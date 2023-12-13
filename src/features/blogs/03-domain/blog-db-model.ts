import { CreateBlogInputDto, UpdateBlogInputDto} from '../types/dto';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument} from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;
@Schema()
export class Blog {
    constructor(inputBlog: CreateBlogInputDto) {
        this.name = inputBlog.name;
        this.description = inputBlog.description;
        this.websiteUrl = inputBlog.websiteUrl;
        this.isMembership = false;
        this.createdAt = new Date();
    }
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

  static createBlog(inputBlog: CreateBlogInputDto): Blog {
    return new this(inputBlog)
  }
  updateBlog(blogNewData: UpdateBlogInputDto): void {
      this.name = blogNewData.name;
      this.description = blogNewData.description;
      this.websiteUrl = blogNewData.websiteUrl;
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {};

BlogSchema.statics = {
  createBlog: Blog.createBlog,
};

