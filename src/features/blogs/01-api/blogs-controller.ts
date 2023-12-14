import {Body, Controller, Delete, Get, HttpCode, NotFoundException, Param, Post, Put, Query} from '@nestjs/common';
import { BlogService } from '../02-services/blog-service';
import {BlogPaginationQueryDto, BlogViewModel, CreateBlogInputDto} from '../types/dto';
import {HttpStatus, WithPagination} from "../../../common/types";
import {BlogsQueryRepository} from "../04-repositories/blogs-query-repository";
import {BlogQueryParams} from "../types/query";
import {getBlogQueryParams} from "../../../helpers/get-query-params";

@Controller('blogs')
export class BlogsController {
  constructor(private blogService: BlogService,
              private blogsQueryRepo: BlogsQueryRepository,) {}

  @Get()
  @HttpCode(HttpStatus.OK_200)
  async getAll(@Query() query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>> {
    const queryParams: BlogQueryParams = getBlogQueryParams(query);
    return await this.blogsQueryRepo.getBlogs(queryParams);
  }
  @Get(':id')
  @HttpCode(HttpStatus.OK_200)
  async getBlogById(@Param('id') blogId: string) {
    const blog = await this.blogsQueryRepo.getBlogById(blogId);
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
  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT_204)
  async updateBlog(@Param('id') blogId: string, @Body() inputModel: CreateBlogInputDto) {
    const updatedBlog = await this.blogService.updateBlogById(blogId, inputModel);
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
    return this.blogService.deleteAllBlogs();
  }
}
