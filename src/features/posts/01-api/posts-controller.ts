import {Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query} from '@nestjs/common';
import {HttpStatus, WithPagination} from "../../../common/types";
import {CreatePostInputModel, CreatePostModel} from "../types/create-post-input-type";
import {PostService} from "../02-services/post-service";
import {BlogsQueryRepository} from "../../blogs/04-repositories/blogs-query-repository";
import {PostViewModel} from "../types/post-view-model";

@Controller('posts')
export class PostsController {
  constructor(private postService: PostService,
              private blogsQueryRepository: BlogsQueryRepository,
              ) {}

  // @Get()
  // @HttpCode(HttpStatus.OK_200)
  // async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
  //   const queryParams: BlogQueryParams = getBlogQueryParams(query);
  //   return await this.blogsQueryRepo.getBlogs(queryParams);
  // }
  // @Get()
  // @HttpCode(HttpStatus.OK_200)
  // async getPosts(@Query() query: BlogPaginationQueryDto) {
  //   try {
  //     const queryParams: PostQueryParams = getPostQueryParams(req);
  //     const posts: WithPagination<PostViewModel> = await this.postService.getPosts(req.userId, queryParams, req.params.id);
  //     res.status(HTTP_STATUSES.OK_200).send(posts);
  //   } catch (e) {
  //     console.log(e);
  //     res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500);
  //   }
  // }
  //
  // @Get(':id')
  // @HttpCode(HttpStatus.OK_200)
  // async getBlogById(@Param('id') blogId: string) {
  //   const blog = await this.blogsQueryRepo.getBlogById(blogId);
  //   if (blog) {
  //     return blog;
  //   }
  //   throw new NotFoundException();
  // }
  //
  // async getPostById(req: Request, res: Response) {
  //   try {
  //     const posts: PostViewModel | null = await this.postService.getPostById(req.params.id, req.userId);
  //     posts ? res.status(HTTP_STATUSES.OK_200).send(posts)
  //         : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  //   } catch (e) {
  //     console.log(e);
  //     res.sendStatus(HTTP_STATUSES.SERVER_ERROR_500);
  //   }
  // }

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

    // if (typeof result === 'string') {
    //   res.status(HTTP_STATUSES.SERVER_ERROR_500).send(result);
    //   return;
    // }
    // const createdPost: PostViewModel = getPostViewModel(result, null);
    // res.status(HTTP_STATUSES.CREATED_201).send(createdPost);
  // }
  //
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
  // async deletePostById(req: Request, res: Response) {
  //   const blog = await this.postService.deletePostById(req.params.id);
  //   blog ? res.status(HTTP_STATUSES.NO_CONTENT_204).send() : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
  // }
  //

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
