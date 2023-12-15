import {CreateBlogInputModel} from "../../src/models/blog/create-input-blog-model";
import request from "supertest";
import {app} from "../../src/app_settings";
import {authBasicHeader} from "./test_utilities";
import {RouterPaths} from "../../src/helpers/router-paths";
import {HTTP_STATUSES, HttpStatusType} from "../../src/enums/http-statuses";
import {BlogViewModel} from "../../src/models/blog/blog-view-model";
import * as supertest from "supertest";


export const blogsTestManager = {
    /*
    * метод создания блога с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
    * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
    * */
    async createBlog(data: CreateBlogInputModel, expectedStatusCode: HttpStatusType)
        : Promise<{ response: supertest.Response; createdBlog: BlogViewModel | null }> {
        const response: request.Response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send(data)
            .expect(expectedStatusCode);

        let createdBlog: BlogViewModel | null = null;

        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {

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
