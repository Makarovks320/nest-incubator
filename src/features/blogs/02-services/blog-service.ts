import { Injectable } from '@nestjs/common';
// import { BlogsRepository } from '../04-repositories/blogs-repository';
// import { BlogViewModel } from '../types/dto';
import { CreateBlogInputDto } from '../types/dto';
// import { BlogDBDto } from '../types/dto';
import {InjectModel} from "@nestjs/mongoose";
import {Blog, BlogDocument} from "../03-domain/blog-db-model";
import {Model} from "mongoose";

@Injectable()
export class BlogService {
  constructor(
      @InjectModel(Blog.name) private blogModel: Model<BlogDocument>
      // private blogsRepository: BlogsRepository
  ) {}
  // async getBlogById(id: string): Promise<BlogViewModel | null> {
  //   return this.blogsRepository.findBlogById(id);
  // }
  async createNewBlog(blog: CreateBlogInputDto): Promise<Blog> {
    // const blog: BlogDBDto = {
    //   id: new Date().valueOf().toString(),
    //   ...b,
    //   isMembership: false,
    //   createdAt: new Date().toISOString(),
    // };
    const createdBlog = new this.blogModel(blog);
    return createdBlog.save();
  }
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
