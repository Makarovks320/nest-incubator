import request from "supertest";
import {HttpStatusType, HTTP_STATUSES} from "../../src/enums/http-statuses";
import {app} from "../../src/app_settings";
import {RouterPaths} from "../../src/helpers/router-paths";
import {AuthLoginInputData} from "../../src/models/auth/auth-model";
import cookie from "cookie";
import {LikeStatusType} from "../../src/models/like/like-db-model";

export const authTestManager = {
    /*
    * логинизация юзера с ожидаемым в ответ кодом статуса (например, можно ожидать 200 или 401).
    * Если ожидаем успешную логинизацию, выполнится проверка тела и куков ответа.
    * */

    async loginUser(data: AuthLoginInputData, expectedStatusCode: HttpStatusType = HTTP_STATUSES.OK_200)
        : Promise<{ accessToken: string, refreshToken: string } | null> {
        const response = await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send({loginOrEmail: data.loginOrEmail, password: data.password})
            .expect(expectedStatusCode);
        if (expectedStatusCode === 200) {
            const accessToken = response.body.accessToken;
            expect(accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);

            const cookieHeader = response.headers['set-cookie'][0];
            expect(cookieHeader.includes('HttpOnly')).toEqual(true);
            expect(cookieHeader.includes('Secure')).toEqual(true);

            const cookies = cookie.parse(cookieHeader);
            const refreshToken = cookies.refreshToken;
            expect(refreshToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);

            return {accessToken, refreshToken}
        }

        return null;
    }
}
