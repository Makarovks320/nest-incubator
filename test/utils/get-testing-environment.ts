import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useAppSettings } from '../../src/application/use-app-settings';
import { RouterPaths } from '../../src/application/types/router-paths';
import { User, UserSchema } from '../../src/features/users/03-domain/user-db-model';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from '../../src/features/blogs/03-domain/blog-db-model';
import { Post, PostSchema } from '../../src/features/posts/03-domain/post-db-model';
import { JwtService } from '../../src/application/adapters/jwt/jwt-service';
import { UsersRepository } from '../../src/features/users/04-repositories/users-repository';
import { Comment, CommentSchema } from '../../src/features/comments/03-domain/comment-db-model';
import { Like, LikeSchema } from '../../src/features/likes/03-domain/like-db-model';
import { EmailAdapter } from '../../src/application/adapters/email-adapter/email-adapter';

export type AppE2eTestingProvider = {
    getApp(): INestApplication;
    getHttp(): SuperAgentTest;
    getRepositoriesAndUtils(): { usersRepository: UsersRepository; jwtService: JwtService };
    getModuleFixture(): Promise<TestingModule>;
};

export class EmailAdapterMock {
    sendEmail = jest.fn(() => true);
}
export function getTestingEnvironment(): AppE2eTestingProvider {
    let app: INestApplication;
    let http: SuperAgentTest;
    let usersRepository: UsersRepository;
    let jwtService: JwtService;
    let moduleFixture: TestingModule;

    beforeAll(async () => {
        moduleFixture = await Test.createTestingModule({
            imports: [
                AppModule,
                MongooseModule.forFeature([{ name: Blog.name, schema: BlogSchema }]),
                MongooseModule.forFeature([{ name: Post.name, schema: PostSchema }]),
                MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
                MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }]),
                MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
            ],
            providers: [JwtService, UsersRepository],
        })
            .overrideProvider(EmailAdapter)
            .useClass(EmailAdapterMock)
            .compile();
        app = moduleFixture.createNestApplication();
        useAppSettings(app);
        await app.init();
        http = agent(app.getHttpServer());
        await agent(app.getHttpServer()).delete(RouterPaths.testing);

        // провайдеры
        usersRepository = moduleFixture.get(UsersRepository);
        jwtService = moduleFixture.get(JwtService);
    });
    afterAll(async () => {
        await app.close();
    });

    return {
        getApp(): INestApplication {
            return app;
        },
        getHttp(): SuperAgentTest {
            return http;
        },
        getRepositoriesAndUtils(): any {
            return {
                usersRepository,
                jwtService,
            };
        },
        async getModuleFixture(): Promise<any> {
            return moduleFixture;
        },
    };
}
