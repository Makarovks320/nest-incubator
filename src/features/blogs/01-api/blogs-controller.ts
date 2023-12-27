import {
    Body,
    Controller,
    Delete,
    Get,
    HttpCode,
    NotFoundException,
    Param,
    Post,
    Put,
    Query,
} from '@nestjs/common';
import { BlogService } from '../02-services/blog-service';
import {
    BlogInputQueryParams,
    BlogViewModel,
    CreateBlogInputModel,
} from '../types/dto';
import { HttpStatus, WithPagination } from '../../../common/types';
import { BlogsQueryRepository } from '../04-repositories/blogs-query-repository';
import { BlogQueryParams } from '../types/query';
import {
    getBlogQueryParams,
    getPostQueryParams,
} from '../../../helpers/get-query-params';
import { PostInputQueryParams } from '../../posts/types/dto';
import { PostViewModel } from '../../posts/types/post-view-model';
import { PostQueryParams } from '../../posts/types/post-query-params-type';
import { PostsQueryRepository } from '../../posts/04-repositories/posts-query-repository';
import {
    CreatePostByBlogsRouterInputModel,
    CreatePostModel,
} from '../../posts/types/create-post-input-type';
import { PostService } from '../../posts/02-services/post-service';
import { CreateBlogInputDto } from '../05-dto/CreateBlogInputDto';
import { UpdateBlogInputDto } from '../05-dto/UpdateBlogInputDto';

@Controller('blogs')
export class BlogsController {
    constructor(
        private blogService: BlogService,
        private postService: PostService,
        private blogsQueryRepository: BlogsQueryRepository,
        private postsQueryRepository: PostsQueryRepository,
    ) {
    }

    @Post()
    @HttpCode(HttpStatus.CREATED_201)
    async createBlog(@Body() inputModel: CreateBlogInputDto): Promise<BlogViewModel> {
        return this.blogService.createNewBlog(inputModel);
    }

    @Get()
    @HttpCode(HttpStatus.OK_200)
    async getAll(@Query() query: BlogInputQueryParams): Promise<WithPagination<BlogViewModel>> {
        const queryParams: BlogQueryParams = getBlogQueryParams(query);
        return await this.blogsQueryRepository.getBlogs(queryParams);
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK_200)
    async getBlogById(@Param('id') blogId: string) {
        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (blog) {
            return blog;
        }
        throw new NotFoundException();
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async updateBlog(
        @Param('id') blogId: string,
        @Body() inputModel: UpdateBlogInputDto,
    ) {
        const updatedBlog = await this.blogService.updateBlogById(
            blogId,
            inputModel,
        );
        if (updatedBlog) {
            return updatedBlog;
        }
        throw new NotFoundException();
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteBlog(@Param('id') blogId: string) {
        const result: boolean = await this.blogService.deleteBlogById(blogId);
        if (result) {
            return result;
        }
        throw new NotFoundException();
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteAllBlogs() {
        return await this.blogService.deleteAllBlogs();
    }

    // Работа с сущностями постов через контроллер блогов
    @Get(':id/posts')
    @HttpCode(HttpStatus.OK_200)
    async getPosts(@Param('id') blogId: string,
                   @Query() query: PostInputQueryParams): Promise<WithPagination<PostViewModel>> {
        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (!blog) {
            throw new NotFoundException();
        }
        const queryParams: PostQueryParams = getPostQueryParams(query);
        const posts: WithPagination<PostViewModel> =
            await this.postsQueryRepository.getPosts(queryParams, blogId);
        return posts;
    }

    @Post(':id/posts')
    @HttpCode(HttpStatus.CREATED_201)
    async createPostForExistingBlog(@Param('id') blogId: string,
                                    @Body() inputModel: CreatePostByBlogsRouterInputModel): Promise<PostViewModel> {
        const blog = await this.blogsQueryRepository.getBlogById(blogId);
        if (!blog)
            throw new NotFoundException('Incorrect blog id: blog is not found');

        const post: CreatePostModel = {
            ...inputModel,
            blogId,
            blogName: blog.name,
        };
        const result: PostViewModel =
            await this.postService.createNewPost(post);
        return result;
    }
}
