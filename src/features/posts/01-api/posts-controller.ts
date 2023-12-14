import {Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query} from '@nestjs/common';
import {HttpStatus, WithPagination} from "../../../common/types";
import {CreatePostInputModel, CreatePostModel} from "../types/create-post-input-type";
import {PostService} from "../02-services/post-service";
import {BlogsQueryRepository} from "../../blogs/04-repositories/blogs-query-repository";
import {PostViewModel} from "../types/post-view-model";
import {PostsQueryRepository} from "../04-repositories/posts-query-repository";
import {PostPaginationQueryDto} from "../types/dto";
import {PostQueryParams} from "../types/post-query-params-type";
import {getPostQueryParams} from "../../../helpers/get-query-params";

@Controller('posts')
export class PostsController {
    constructor(private postService: PostService,
                private blogsQueryRepository: BlogsQueryRepository,
                private postsQueryRepository: PostsQueryRepository,
    ) {
    }

    @Get()
    @HttpCode(HttpStatus.OK_200)
    async getPosts(@Query() query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
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
            blogName: blog.name
        }
        const result: PostViewModel = await this.postService.createNewPost(post);
        return result;
    }

    // async updatePost(req: Request, res: Response) {
    //   try {
    //
    //     const blog = await this.blogsRepository.findBlogById(req.body.blogId);
    //     if (!blog) throw new Error('Incorrect blog id: blog is not found');
    //
    //     await this.postService.updatePostById(req.params.id, {...req.body, blogName: blog.name}, req.userId);
    //     res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    //   } catch (e) {
    //     console.log(e);
    //     res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500);
    //   }
    // }
    //
    // async deleteAllPosts(req: Request, res: Response) {
    //   await this.postService.deleteAllPosts();
    //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
    // }
    //
    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deletePostById(@Param('id') postId: string) {
        const result: boolean = await this.postService.deletePostById(postId);
        if (!result) throw new NotFoundException();
        return result;
    }


    // @Put(':id')
    // @HttpCode(HttpStatus.NO_CONTENT_204)
    // async updateBlog(@Param('id') blogId: string, @Body() inputModel: CreateBlogInputDto) {
    //   const updatedBlog = await this.blogService.updateBlogById(blogId, inputModel);
    //   if (updatedBlog) {
    //     return updatedBlog;
    //   }
    //   throw new NotFoundException();
    // }
    // @Delete(':id')
    // @HttpCode(HttpStatus.NO_CONTENT_204)
    // async deleteBlog(@Param('id') blogId: string) {
    //   const result: boolean = await this.blogService.deleteBlogById(blogId);
    //   if (result) {
    //     return result;
    //   }
    //     throw new NotFoundException();
    // }
    // @Delete()
    // @HttpCode(HttpStatus.NO_CONTENT_204)
    // async deleteAllBlogs() {
    //   return this.blogService.deleteAllBlogs();
    // }
}
