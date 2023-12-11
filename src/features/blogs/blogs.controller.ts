import { Body, Controller, Post } from '@nestjs/common';
// import { HttpStatus } from '../../utils/types';
import { BlogService } from './services/blog-service';
// import { Response } from 'express';
import { CreateBlogInputDto } from './types/dto';

@Controller('blogs')
export class BlogsController {
  constructor(private blogService: BlogService) {}

  // @Get()
  // async getBlogs(@Query('term') term: string) {
  //   const queryParams: BlogQueryParams = getBlogQueryParams(req);
  //   const blogs = await this.blogsQueryRepository.getBlogs(queryParams);
  //   res.send(blogs);
  // }
  // @Get(':id')
  // async getBlogById(@Param() params: { id: string }) {
  //   const blog = await this.blogService.getBlogById(req.params.id);
  //   blog ? res.send(blog) : res.sendStatus(HTTP_STATUSES.NOT_FOUND_404);
  // }
  @Post()
  async createBlog(
    @Body() inputModel: CreateBlogInputDto,
    // @Res() res: Response,
  ) {
    const result =
      await this.blogService.createNewBlog(inputModel);
      return result;
    // res.status(HttpStatus.CREATED_201).send(result);
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
