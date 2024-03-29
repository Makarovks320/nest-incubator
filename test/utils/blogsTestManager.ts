import { BlogViewModel, CreateBlogInputModel } from '../../src/features/blogs/types/dto';
import request from 'supertest';
import * as supertest from 'supertest';
import { RouterPaths } from '../../src/application/types/router-paths';
import { HttpStatus, HttpStatusType } from '../../src/application/types/types';
import { authBasicHeader } from './test_utilities';
import { AppE2eTestingProvider, getTestingEnvironment } from './get-testing-environment';
import { UpdateBlogInputDto } from '../../src/features/blogs/05-dto/UpdateBlogInputDto';

const testingProvider: AppE2eTestingProvider = getTestingEnvironment();
export const blogsTestManager = {
    /*
     * метод создания блога с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
     * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
     * */
    async createBlog(
        data: CreateBlogInputModel,
        expectedStatusCode: HttpStatusType,
    ): Promise<{ response: supertest.Response; createdBlog: BlogViewModel | null }> {
        const response: request.Response = await testingProvider
            .getHttp()
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send(data)
            .expect(expectedStatusCode);

        let createdBlog: BlogViewModel | null = null;

        if (expectedStatusCode === HttpStatus.CREATED_201) {
            createdBlog = response.body;

            expect(createdBlog).toEqual({
                createdAt: expect.any(String),
                id: expect.any(String),
                description: data.description,
                isMembership: false,
                name: data.name,
                websiteUrl: data.websiteUrl,
            });
        }

        return { response, createdBlog };
    },

    async updateBlog(
        blogid: string,
        data: UpdateBlogInputDto,
        expectedStatusCode: HttpStatusType,
        authorization = authBasicHeader,
    ): Promise<void> {
        await testingProvider
            .getHttp()
            .put(`${RouterPaths.blogs}/${blogid}`)
            .set(authorization)
            .send(data)
            .expect(expectedStatusCode);
    },
};
