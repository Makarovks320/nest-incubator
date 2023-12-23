import { Controller, Delete, HttpCode, Injectable } from '@nestjs/common';
import { HttpStatus } from '../../../common/types';
import { BlogsRepository } from '../../blogs/04-repositories/blogs-repository';
import { PostsRepository } from '../../posts/04-repositories/posts-repository';
import { UsersRepository } from '../../users/04-repositories/users-repository';

@Injectable()
@Controller('testing')
export class TestingController {
    constructor(
        private blogsRepo: BlogsRepository,
        private postsRepo: PostsRepository,
        private usersRepo: UsersRepository,
    ) {}

    @Delete('all-data')
    @HttpCode(HttpStatus.NO_CONTENT_204)
    async deleteAll() {
        await this.blogsRepo.clear();
        await this.postsRepo.clear();
        await this.usersRepo.clear();
    }
}
