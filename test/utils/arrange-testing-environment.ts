import { INestApplication } from '@nestjs/common';
import { agent, SuperAgentTest } from 'supertest';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { useAppSettings } from '../../src/application/utils/use-app-settings';
import { RouterPaths } from '../../src/application/utils/router-paths';

export type AppE2eTestingProvider = {
    getApp(): INestApplication;
    getHttp(): SuperAgentTest;
};

export function arrangeTestingEnvironment(): AppE2eTestingProvider {
    let app: INestApplication;
    let http: SuperAgentTest;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
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
