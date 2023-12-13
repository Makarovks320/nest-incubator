import { Injectable } from '@nestjs/common';
import {BlogViewModel, CreateBlogInputDto, IBlog} from '../types/dto';
import {Blog} from "../03-domain/blog-db-model";
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
  async updateBlogById(blogId: string, blogNewData: CreateBlogInputDto): Promise<boolean> {
      const blogForUpdating = await this.blogsQueryRepository.getBlogById(blogId);
      if (!blogForUpdating) return false;
      blogForUpdating.updateBlog(blogNewData);
      await this.blogsRepository.update(blogForUpdating)
      return true;
  }
  async deleteAllBlogs(): Promise<void> {
      await this.blogsRepository.clear();
  }
  async deleteBlogById(id: string): Promise<boolean> {
      return await this.blogsRepository.deleteBlogById(id);
  }
}
