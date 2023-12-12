import {Body, Controller, Get, HttpCode, NotFoundException, Param, Post, Query} from '@nestjs/common';
import { BlogService } from '../02-services/blog-service';
import {BlogPaginationQueryDto, BlogViewModel, CreateBlogInputDto} from '../types/dto';
import {HttpStatus, WithPagination} from "../../../common/types";
import {BlogsQueryRepository} from "../04-repositories/blogs.query.repository";

@Controller('blogs')
export class BlogsController {
  constructor(private blogService: BlogService,
              private blogsQueryRepo: BlogsQueryRepository,) {}

  // @Get()
  // @HttpCode(HttpStatus.OK_200)
  // async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
  //   return await this.blogsQueryRepo.getBlogs(BlogsDataMapper.toRepoQuery(query), BlogsDataMapper.toBlogsView);
    // const queryParams: BlogQueryParams = getBlogQueryParams(req);
    // return await this.blogsQueryRepository.getBlogs(queryParams);
  // }
  @Get(':id')
  @HttpCode(HttpStatus.OK_200)
  async getBlogById(@Param('id') blogId: string) {
    const blog = await this.blogService.getBlogById(blogId);
    if (blog) {
      return blog;
    }
    throw new NotFoundException();
  }
  @Post()
  @HttpCode(HttpStatus.CREATED_201)
  async createBlog(@Body() inputModel: CreateBlogInputDto): Promise<BlogViewModel> {
      return this.blogService.createNewBlog(inputModel);
  }
  // async updateBlog(req: Request, res: Response) {
  //   const newBlog = await this.blogService.updateBlogById(req.params.id, req.body);
  //   newBlog ? res.status(HTTP_STATUSES.NO_CONTENT_204).send(newBlog) : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  // }
  //
  // async deleteAllBlogs(req: Request, res: Response) {
  //   await this.blogService.deleteAllBlogs();
  //   res.sendStatus(HTTP_STATUSES.NO_CONTENT_204);
  // }
  //
  // async deleteBlogById(req: Request, res: Response) {
  //   const isBlogDeleted = await this.blogService.deleteBlogById(req.params.id);
  //   isBlogDeleted ? res.status(HTTP_STATUSES.NO_CONTENT_204).send() : res.status(HTTP_STATUSES.NOT_FOUND_404).send();
  // }
}
