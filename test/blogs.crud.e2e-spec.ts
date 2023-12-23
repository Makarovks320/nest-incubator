import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { SuperAgentTest } from 'supertest';
import { AppModule } from './../src/app.module';
import { HttpStatus } from '../src/common/types';
import { RouterPaths } from '../src/application/utils/router-paths';

describe('/blogs tests', () => {
    let app: INestApplication;
    let http: SuperAgentTest;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        await app.init();

        await request(app.getHttpServer())
            .delete(RouterPaths.testing);
        http = app.getHttpServer();
    });

    afterAll(async () => {
        await app.close();
    });

    it(`should return an object with 0 totalCount`, async () => {
        await request(http)
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []});
    });
});
