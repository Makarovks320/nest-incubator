import 'reflect-metadata';

import {
  // FilterQuery,
  Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
// import { withModelPagination } from '../../../utils/withModelPagination';
// import { WithPagination } from '../../../utils/types';
import { InjectModel } from '@nestjs/mongoose';
import {Blog, BlogDocument} from "../03-domain/blog-db-model";
import {
  BlogMongoType,
  // BlogQueryDto,
  BlogViewModel
} from '../types/dto';
// import { BlogListMapperType, BlogMapperType } from '../types/common';
import {BlogsDataMapper} from "../01-api/blogs.data-mapper";

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  // async getBlogs<T>(query: BlogQueryDto, dto: BlogListMapperType<T>): Promise<WithPagination<T>> {
  //   const filter: FilterQuery<IBlog> = {};
  //   if (query.searchNameTerm != null) {
  //     filter.name = { $regex: query.searchNameTerm, $options: 'i' };
  //   }
  //   return withModelPagination<BlogMongoType, T>(this.blogModel, filter, query, dto);
  // }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const blog: BlogMongoType | null = await this.blogModel.findById(id).lean();
    if (blog) {
      return BlogsDataMapper.toBlogView(blog);
    }
    return null;
  }
}
