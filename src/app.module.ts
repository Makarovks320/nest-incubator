import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BlogsController } from './features/blogs/01-api/blogs-controller';
import { MongooseModule } from '@nestjs/mongoose';
import { BlogService } from './features/blogs/02-services/blog-service';
import { BlogsRepository } from './features/blogs/04-repositories/blogs-repository';
import { appConfig } from './application/config';
import { Blog, BlogSchema } from './features/blogs/03-domain/blog-db-model';
import { BlogsQueryRepository } from './features/blogs/04-repositories/blogs-query-repository';
import { TestingController } from './features/tests/api/testing.controller';
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
import { AuthController } from './features/auth/01-api/auth-controller';
import { AuthService } from './features/auth/02-application/auth-service';
import { SessionService } from './features/auth/02-application/session-service';
import { JwtService } from './application/adapters/jwt/jwt-service';
import { AuthSession, AuthSessionSchema } from './features/auth/03-domain/session-model';
import { EmailManager } from './application/adapters/email-adapter/emailManager';
import { EmailAdapter } from './application/adapters/email-adapter/email-adapter';
import { SessionsRepository } from './features/auth/04-repositories/sessions-repository';
import { RecoveryCodeValidator } from './application/decorators/validation/IsRecoveryCodeValid';
import { UserIdMiddleware } from './middlewares/user-id-middleware';
import { RouterPaths } from './application/types/router-paths';
import { EmailExistenceValidator } from './application/decorators/validation/EmailExistenceValidator';
import { ConfirmationCodeValidator } from './application/decorators/validation/IsConfirmationCodeValid';
import { CryptoService } from './application/adapters/crypto/crypto-service';
import { ThrottlerModule } from '@nestjs/throttler';
import { AuthHelper } from './application/helpers/auth-helper';
import { CommentService } from './features/comments/02-services/comment-service';
import { CommentsQueryRepository } from './features/comments/04-repositories/comments-query-repository';
import { CommentsRepository } from './features/comments/04-repositories/comments-repository';
import { Comment, CommentSchema } from './features/comments/03-domain/comment-db-model';
import { CommentsController } from './features/comments/01-api/comments-controller';
import { CommentsDataMapper } from './features/comments/01-api/comments-data-mapper';
import { CommentExistenceValidator } from './application/decorators/validation/CommentExistenceValidator';
import { Like, LikeSchema } from './features/likes/03-domain/like-db-model';
import { LikesQueryRepository } from './features/likes/04-repositories/likes-query-repository';
import { LikesRepository } from './features/likes/04-repositories/likes-repository';
import { LikeService } from './features/likes/02-services/like-service';
import { GetUserIdFromAccessToken } from './middlewares/GetUserIdFromAccessToken';
import { IsBlogIdExistValidator } from './application/decorators/validation/IsBlogExist';
import { SessionsQueryRepository } from './features/auth/04-repositories/sessions-query-repository';
import { AuthSecurityController } from './features/auth/01-api/security-devices-controller';

const services = [
    AppService,
    AuthService,
    BlogService,
    PostService,
    SessionService,
    UserService,
    CommentService,
    LikeService,
];
const queryRepositories = [
    BlogsQueryRepository,
    PostsQueryRepository,
    UsersQueryRepository,
    CommentsQueryRepository,
    LikesQueryRepository,
    SessionsQueryRepository,
];
const repositories = [
    BlogsRepository,
    PostsRepository,
    SessionsRepository,
    UsersRepository,
    CommentsRepository,
    LikesRepository,
];
const customValidators = [
    ConfirmationCodeValidator,
    RecoveryCodeValidator,
    EmailExistenceValidator,
    CommentExistenceValidator,
    IsBlogIdExistValidator,
];
const adapters = [EmailAdapter, EmailManager, JwtService, CryptoService];
const helpers = [AuthHelper, CommentsDataMapper];

@Module({
    imports: [
        ThrottlerModule.forRoot([{ ttl: 10000, limit: 5 }]),
        MongooseModule.forRoot(appConfig.mongoUrl, {
            dbName: appConfig.dbName,
        }),
        MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
        MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        MongooseModule.forFeature([{ name: AuthSession.name, schema: AuthSessionSchema }]),
        MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
        MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    ],
    controllers: [
        AppController,
        AuthController,
        AuthSecurityController,
        BlogsController,
        PostsController,
        UsersController,
        CommentsController,
        TestingController,
    ],
    providers: [...customValidators, ...services, ...queryRepositories, ...repositories, ...adapters, ...helpers],
})
export class AppModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserIdMiddleware)
            .forRoutes({ path: RouterPaths.auth + '/new-password', method: RequestMethod.POST });
        consumer
            .apply(GetUserIdFromAccessToken)
            .forRoutes(
                { path: RouterPaths.blogs + '/:id' + '/posts', method: RequestMethod.GET },
                { path: RouterPaths.posts, method: RequestMethod.GET },
                { path: RouterPaths.posts + '/:id', method: RequestMethod.GET },
                { path: RouterPaths.posts + '/:id' + '/comments', method: RequestMethod.GET },
                { path: RouterPaths.posts + '/:id' + '/like-status', method: RequestMethod.GET },
                { path: RouterPaths.comments + '/:id', method: RequestMethod.GET },
            );
    }
}
