import { Controller, Delete, HttpCode, Injectable } from '@nestjs/common';
import {HttpStatus} from "../../../common/types";
import {BlogsRepository} from "../../blogs/04-repositories/blogs-repository";
import {PostsRepository} from "../../posts/04-repositories/posts-repository";

@Injectable()
@Controller('testing')
export class TestsController {
  constructor(
    private blogsRepo: BlogsRepository,
    private postsRepo: PostsRepository,
  ) {}

  @Delete('all-data')
  @HttpCode(HttpStatus.NO_CONTENT_204)
  async deleteAll() {
    await this.blogsRepo.clear();
    await this.postsRepo.clear();
  }
}
