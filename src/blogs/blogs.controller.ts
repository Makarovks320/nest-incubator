import { Body, Controller, Get, Param, Post } from '@nestjs/common';

const counter = () => {
  let count = 0;
  return () => {
    count++;
    return count;
  };
};
const idIncremenator = counter();
const blogsCollection: Array<CreateBlogInputDto & { id: number }> = [];
@Controller('blogs')
export class BlogsController {
  @Get()
  async getBlog() {
    return blogsCollection;
  }
  @Get(':id')
  async getBlogById(@Param() params: { id: string }) {
    return blogsCollection.filter((item) => item.id === +params.id);
  }
  @Post()
  async createBlog(@Body() inputModel: CreateBlogInputDto) {
    const newBlog = {
      id: idIncremenator(),
      blogName: inputModel.blogName,
      description: inputModel.description,
    };
    blogsCollection.push(newBlog);
    return newBlog;
  }
}

type CreateBlogInputDto = {
  blogName: string;
  description: string;
};
