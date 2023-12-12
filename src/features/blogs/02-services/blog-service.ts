import { Injectable } from '@nestjs/common';
// import { BlogViewModel } from '../types/dto';
import {BlogViewModel, CreateBlogInputDto, IBlog} from '../types/dto';
// import { BlogDBDto } from '../types/dto';
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "../03-domain/blog-db-model";
import {Model} from "mongoose";
import {BlogsRepository} from "../04-repositories/blogs-repository";
import {BlogsQueryRepository} from "../04-repositories/blogs.query.repository";

@Injectable()
export class BlogService {
  constructor(
      private blogsRepository: BlogsRepository,
      private blogsQueryRepository: BlogsQueryRepository
  ) {}
  async createNewBlog(blog: CreateBlogInputDto): Promise<BlogViewModel> {
    const createdBlog: IBlog = Blog.createBlog(blog)
    return await this.blogsRepository.save(createdBlog)
  }
  // async getBlogById(id: string): Promise<BlogViewModel | null> {
  //   return await this.blogsQueryRepository.getBlogById(id);
  // }
  // async updateBlogById(id: string, p: BlogViewModel): Promise<boolean> {
  //     return await this.blogsRepository.updateBlogById(id, p);
  // }
  // async deleteAllBlogs(): Promise<void> {
  //     await this.blogsRepository.deleteAllBlogs();
  // }
  // async deleteBlogById(id: string): Promise<boolean> {
  //     return await this.blogsRepository.deleteBlogById(id);
  // }
}
