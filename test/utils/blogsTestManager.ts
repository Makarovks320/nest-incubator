import { BlogViewModel, CreateBlogInputModel } from '../../src/features/blogs/types/dto';
import request from "supertest";
import * as supertest from "supertest";
import { RouterPaths } from '../../src/application/utils/router-paths';
import { HttpStatus, HttpStatusType } from '../../src/common/types';
import { authBasicHeader } from './test_utilities';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from './arrange-testing-environment';


const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();
export const blogsTestManager = {

    /*
    * метод создания блога с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
    * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
    * */
    async createBlog(data: CreateBlogInputModel, expectedStatusCode: HttpStatusType)
        : Promise<{ response: supertest.Response; createdBlog: BlogViewModel | null }> {
        const response: request.Response = await testingProvider.getHttp()
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
                websiteUrl: data.websiteUrl
            });
        }

        return {response, createdBlog};
    }
}
