import { Injectable } from '@nestjs/common';
import { BlogViewModel, CreateBlogInputModel, IBlog } from '../types/dto';
import { Blog } from '../03-domain/blog-db-model';
import { BlogsRepository } from '../04-repositories/blogs-repository';

@Injectable()
export class BlogService {
    constructor(private blogsRepository: BlogsRepository) {}

    async createNewBlog(blog: CreateBlogInputModel): Promise<BlogViewModel> {
        const createdBlog: IBlog = Blog.createBlog(blog);
        return await this.blogsRepository.save(createdBlog);
    }

    async updateBlogById(blogId: string, blogNewData: CreateBlogInputModel): Promise<boolean> {
        const blogForUpdating = await this.blogsRepository.getBlogById(blogId);
        if (!blogForUpdating) return false;
        const isUpdated = await this.blogsRepository.updateBlogById(blogId, blogNewData);
        return isUpdated;
    }

    async deleteAllBlogs(): Promise<void> {
        await this.blogsRepository.clear();
    }

    async deleteBlogById(id: string): Promise<boolean> {
        return await this.blogsRepository.deleteBlogById(id);
    }
}
