import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/01-api/blogs-controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './features/blogs/02-services/blog-service';
import { BlogsRepository } from './features/blogs/04-repositories/blogs-repository';
import { appConfig } from './utils/config';
import { Blog, BlogSchema } from './features/blogs/03-domain/blog-db-model';
import { BlogsQueryRepository } from './features/blogs/04-repositories/blogs-query-repository';
import { TestsController } from './features/tests/api/tests.controller';
import { PostsController } from './features/posts/01-api/posts-controller';
import { PostsRepository } from './features/posts/04-repositories/posts-repository';
import { PostsQueryRepository } from './features/posts/04-repositories/posts-query-repository';
import { Post, PostSchema } from './features/posts/03-domain/post-db-model';
import { PostService } from './features/posts/02-services/post-service';
import { UsersController } from './features/users/01-api/users-controller';
import { UserService } from './features/users/02-services/user-service';
import { UsersRepository } from './features/users/04-repositories/users-repository';
import { UsersQueryRepository } from './features/users/04-repositories/users-query-repository';
import { User, UserSchema } from './features/users/03-domain/user-db-model';

@Module({
    imports: [
        MongooseModule.forRoot(appConfig.mongoUrl, {
            dbName: appConfig.dbName,
        }),
        MongooseModule.forFeature([
            {
                name: Blog.name,
                schema: BlogSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: Post.name,
                schema: PostSchema,
            },
        ]),
        MongooseModule.forFeature([
            {
                name: User.name,
                schema: UserSchema,
            },
        ]),
    ],
    controllers: [AppController, BlogsController, PostsController, UsersController, TestsController],
    providers: [
        AppService,
        BlogService,
        BlogsRepository,
        BlogsQueryRepository,
        PostService,
        PostsRepository,
        PostsQueryRepository,
        UserService,
        UsersRepository,
        UsersQueryRepository,
    ],
})
export class AppModule {}
