import request from "supertest";
import * as supertest from "supertest";
import { HttpStatus, HttpStatusType } from '../../src/common/types';
import { RouterPaths } from '../../src/application/utils/router-paths';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from './arrange-testing-environment';
import { CreateUserInputModel } from '../../src/features/users/types/create-input-user-model';
import { UserViewModel } from '../../src/features/users/types/user-view-model';

const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();
export const usersTestManager = {
    /*
    * метод создания юзера с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
    * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
    * */
    async createUser(data: CreateUserInputModel, expectedStatusCode: HttpStatusType = HttpStatus.CREATED_201, headers = {})
    : Promise<{ response: supertest.Response; createdUser: UserViewModel | null }> {
        const response: request.Response = await testingProvider.getHttp()
            .post(RouterPaths.users)
            .set(headers)
            .send(data)
            .expect(expectedStatusCode)

        let createdUser: UserViewModel | null = null

        if(expectedStatusCode === HttpStatus.CREATED_201) {

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
