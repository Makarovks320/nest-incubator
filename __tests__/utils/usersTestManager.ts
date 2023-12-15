import request from "supertest";
import {HttpStatusType, HTTP_STATUSES} from "../../src/enums/http-statuses";
import {app} from "../../src/app_settings";
import {RouterPaths} from "../../src/helpers/router-paths";
import {CreateUserInputModel} from "../../src/models/user/create-input-user-model";
import * as supertest from "supertest";
import {UserViewModel} from "../../src/models/user/user-view-model";

export const usersTestManager = {
    /*
    * метод создания юзера с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
    * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
    * */
    async createUser(data: CreateUserInputModel, expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201, headers = {})
    : Promise<{ response: supertest.Response; createdUser: UserViewModel | null }> {
        const response: request.Response = await request(app)
            .post(RouterPaths.users)
            .set(headers)
            .send(data)
            .expect(expectedStatusCode)

        let createdUser: UserViewModel | null = null

        if(expectedStatusCode === HTTP_STATUSES.CREATED_201) {

            createdUser = response.body

            expect(createdUser).toEqual({
                id: expect.any(String),
                login: data.login,
                email: data.email,
                createdAt: expect.any(String),

            })
        }
        return {response, createdUser}
    }
}
