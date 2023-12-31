import { Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query } from '@nestjs/common';
import { HttpStatus, WithPagination } from '../../../common/types';
import { CreatePostInputModel, CreatePostModel, UpdatePostInputModel } from '../types/create-post-input-type';
import { PostService } from '../02-services/post-service';
import { BlogsQueryRepository } from '../../blogs/04-repositories/blogs-query-repository';
import { PostViewModel } from '../types/post-view-model';
import { PostsQueryRepository } from '../04-repositories/posts-query-repository';
import { PostInputQueryParams } from '../types/dto';
import { PostQueryParams } from '../types/post-query-params-type';
import { getPostQueryParams } from '../../../helpers/get-query-params';

@Controller('posts')
export class PostsController {
    constructor(
        private postService: PostService,
        private blogsQueryRepository: BlogsQueryRepository,
        private postsQueryRepository: PostsQueryRepository,
    ) {}

    @Get()
    @HttpCode(HttpStatus.OK_200)
    async getPosts(@Query() query: PostInputQueryParams): Promise<WithPagination<PostViewModel>> {
        const queryParams: PostQueryParams = getPostQueryParams(query);
        const posts: WithPagination<PostViewModel> = await this.postsQueryRepository.getPosts(queryParams);
        return posts;
    }

    @Get(':id')
    @HttpCode(HttpStatus.OK_200)
    async getPostById(@Param('id') postId: string) {
        const post: PostViewModel | null = await this.postsQueryRepository.getPostById(postId);
        if (!post) {
            throw new NotFoundException();
        }
        return post;
    }

    @Post()
    @HttpCode(HttpStatus.CREATED_201)
    async createNewPost(@Body() inputModel: CreatePostInputModel): Promise<PostViewModel> {
        const blog = await this.blogsQueryRepository.getBlogById(inputModel.blogId);
        if (!blog) throw new NotFoundException('Incorrect blog id: blog is not found');

        const post: CreatePostModel = {
            ...inputModel,
            blogName: blog.name,
        };
        const result: PostViewModel = await this.postService.createNewPost(post);
        return result;
    }

    @Put(':id')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async updatePost(@Param('id') postId: string, @Body() inputModel: UpdatePostInputModel) {
        const updatedPost = await this.postService.updatePostById(postId, inputModel);
        if (updatedPost) {
            return updatedPost;
        }
        throw new NotFoundException();
    }

    @Delete()
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteAllPosts() {
        return await this.postService.deleteAllPosts();
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deletePostById(@Param('id') postId: string) {
        const result: boolean = await this.postService.deletePostById(postId);
        if (!result) throw new NotFoundException();
        return result;
    }
}
