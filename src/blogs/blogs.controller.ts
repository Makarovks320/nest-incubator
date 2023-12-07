import { Controller, Get } from '@nestjs/common';

@Controller('blogs')
export class BlogsController {
  @Get()
  async getBlog() {
    return {
      id: new Date().toISOString(),
      blogName: 'blog',
      description: 'description',
    };
  }
}
