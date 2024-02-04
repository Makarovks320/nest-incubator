import request from 'supertest';
import cookie from 'cookie';
import { HttpStatus, HttpStatusType } from '../../src/application/types/types';
import { AppE2eTestingProvider, getTestingEnvironment } from './get-testing-environment';
import { RouterPaths } from '../../src/application/types/router-paths';
import { AuthLoginInputDto } from '../../src/features/auth/05-dto/AuthLoginInputDto';
import { AuthTokenPair } from '../../src/application/adapters/jwt/jwt-service';

const testingProvider: AppE2eTestingProvider = getTestingEnvironment();
export const authTestManager = {
    /*
     * логинизация юзера с ожидаемым в ответ кодом статуса (например, можно ожидать 200 или 401).
     * Если ожидаем успешную логинизацию, выполнится проверка тела и куков ответа.
     * */

    async loginUser(
        data: AuthLoginInputDto,
        expectedStatusCode: HttpStatusType = HttpStatus.OK_200,
    ): Promise<{ accessToken: string; refreshToken: string } | null> {
        const response: request.Response = await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/login`)
            .send({ loginOrEmail: data.loginOrEmail, password: data.password })
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

            return { accessToken, refreshToken };
        }

        return null;
    },

    /*
     * обновление токенов
     * */
    async refreshToken(
        oldRefreshToken: string,
        expectedStatusCode: HttpStatusType = HttpStatus.OK_200,
    ): Promise<AuthTokenPair | null> {
        const response: request.Response = await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/refresh-token`)
            .set('cookie', 'refreshToken=' + oldRefreshToken)
            .expect(expectedStatusCode);

        if (expectedStatusCode === 200) {
            const tokenPair: AuthTokenPair = this.getTokensFromResponse(response);
            return tokenPair;
        }

        return null;
    },

    getTokensFromResponse(response: request.Response): AuthTokenPair {
        const accessToken = response.body.accessToken;
        expect(accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);

        const cookieHeader = response.headers['set-cookie'][0];
        expect(cookieHeader.includes('HttpOnly')).toEqual(true);
        expect(cookieHeader.includes('Secure')).toEqual(true);

        const cookies = cookie.parse(cookieHeader);
        const refreshToken = cookies.refreshToken;
        expect(refreshToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);

        return { accessToken, refreshToken };
    },
};
