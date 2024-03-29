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
    Req,
    UseGuards,
} from '@nestjs/common';
import { HttpStatus, WithPagination } from '../../../application/types/types';
import { CreatePostModel } from '../types/create-post-input-type';
import { PostService } from '../02-services/post-service';
import { BlogsQueryRepository } from '../../blogs/04-repositories/blogs-query-repository';
import { PostViewModel } from '../types/post-view-model';
import { PostsQueryRepository } from '../04-repositories/posts-query-repository';
import { PostInputQueryParams } from '../types/dto';
import { PostQueryParams } from '../types/post-query-params-type';
import { getCommentQueryParams, getPostQueryParams } from '../../../application/helpers/get-query-params';
import { CreatePostInputDto } from '../05-dto/CreatePostInputDto';
import { UpdatePostInputDto } from '../05-dto/UpdatePostInputDto';
import { AccessTokenGuard } from '../../../application/guards/AccessTokenGuard';
import { CreateCommentInputModel } from '../../comments/01-api/models/input-models/CreateCommentInputModel';
import { CommentService } from '../../comments/02-services/comment-service';
import { Request } from 'express';
import { CommentInputQueryParams } from '../../comments/01-api/models/input-models/CommentInputQueryParams';
import { CommentViewModel } from '../../comments/01-api/models/output-models/CommentViewModel';
import { CommentsQueryRepository } from '../../comments/04-repositories/comments-query-repository';
import { CommentQueryParams } from '../../comments/types/comment-query-params-type';
import { LikeStatusUpdateDto } from '../../likes/05-dto/LikeStatusUpdateDto';
import { ResultObject } from '../../../application/result-object/ResultObject';
import { BasicAuthGuard } from '../../../application/guards/BasicAuthGuard';
import { handleResultObject } from '../../../application/result-object/ServiceErrorList';

@Controller('posts')
export class PostsController {
    constructor(
        private postService: PostService,
        private commentService: CommentService,
        private blogsQueryRepository: BlogsQueryRepository,
        private postsQueryRepository: PostsQueryRepository,
        private commentsQueryRepository: CommentsQueryRepository,
    ) {}

    @Post()
    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.CREATED_201)
    async createNewPost(@Body() inputModel: CreatePostInputDto): Promise<PostViewModel> {
        const blog = await this.blogsQueryRepository.getBlogById(inputModel.blogId);
        if (!blog) throw new NotFoundException('Incorrect blog id: blog is not found');

        const post: CreatePostModel = {
            ...inputModel,
            blogName: blog.name,
        };
        const result: PostViewModel = await this.postService.createNewPost(post);
        return result;
    }

    @Get()
    @HttpCode(HttpStatus.OK_200)
    async getPosts(@Query() query: PostInputQueryParams, @Req() req: Request): Promise<WithPagination<PostViewModel>> {
        const queryParams: PostQueryParams = getPostQueryParams(query);
        const posts: WithPagination<PostViewModel> = await this.postService.getPosts(req.userId, queryParams);
        return posts;
    }

    @Get('/:id')
    @HttpCode(HttpStatus.OK_200)
    async getPostById(@Param('id') postId: string, @Req() req: Request) {
        const result = await this.postService.getPostById(postId, req.userId);
        handleResultObject(result);
        return result.getData();
    }

    @Put('/:id')
    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async updatePost(@Param('id') postId: string, @Body() inputModel: UpdatePostInputDto) {
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

    @Delete('/:id')
    @UseGuards(BasicAuthGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deletePostById(@Param('id') postId: string) {
        const isDeleted: boolean = await this.postService.deletePostById(postId);
        if (!isDeleted) throw new NotFoundException();
    }

    // комментарии
    @Get('/:id/comments')
    async getCommentsForPost(
        @Param('id') postId: string,
        @Query() query: CommentInputQueryParams,
        @Req() req: Request,
    ) {
        const postExist: boolean = await this.postsQueryRepository.checkPostExists(postId);
        if (!postExist) throw new NotFoundException();

        const queryParams: CommentQueryParams = getCommentQueryParams(query);
        const foundComments: WithPagination<CommentViewModel> = await this.commentsQueryRepository.getCommentsForPost(
            postId,
            queryParams,
            req.userId,
        );
        return foundComments;
    }

    @Post('/:id/comments')
    @UseGuards(AccessTokenGuard)
    async createCommentToPost(
        @Param('id') postId: string,
        @Body() input: CreateCommentInputModel,
        @Req() req: Request,
    ) {
        const result: ResultObject<CommentViewModel> = await this.commentService.createNewComment(
            postId,
            input.content,
            req.userId,
        );
        handleResultObject(result);

        return result.getData();
    }

    @Put('/:id/like-status')
    @UseGuards(AccessTokenGuard)
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async changeLikeStatus(@Param('id') postId: string, @Body() input: LikeStatusUpdateDto, @Req() req: Request) {
        const result: ResultObject = await this.postService.CreateOrUpdateLike({
            postId: postId,
            userId: req.userId,
            status: input.likeStatus,
        });
        handleResultObject(result);
    }
}
