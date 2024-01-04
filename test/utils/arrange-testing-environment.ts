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

export type AppE2eTestingProvider = {
    getApp(): INestApplication;
    getHttp(): SuperAgentTest;
};

export function arrangeTestingEnvironment(): AppE2eTestingProvider {
    let app: INestApplication;
    let http: SuperAgentTest;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                AppModule,
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
            providers: [],
        }).compile();
        app = moduleFixture.createNestApplication();
        useAppSettings(app);
        await app.init();
        http = agent(app.getHttpServer());
        await agent(app.getHttpServer()).delete(RouterPaths.testing);
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
    };
}
