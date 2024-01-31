import { HttpStatus } from '../../../src/application/types/types';
import { UserViewModel } from '../../../src/features/users/types/user-view-model';
import { usersTestManager } from '../../utils/usersTestManager';
import { authBasicHeader } from '../../utils/test_utilities';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from '../../utils/arrange-testing-environment';
import { CreateUserInputModel } from '../../../src/features/users/05-dto/CreateUserInputModel';
import { authTestManager } from '../../utils/authTestManager';
import { AuthLoginInputDto } from '../../../src/features/auth/05-dto/AuthLoginInputDto';

describe('testing auth tokens flow', () => {
    const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();

    // изначальные credentials
    const email: string = 'email123@mail.com';
    const login: string = 'login1';
    const password: string = 'password123';
    // сюда сохраним юзера
    let user: UserViewModel | null = null;

    beforeAll(async () => {
        // Создаем юзера
        const userData: CreateUserInputModel = {
            login: login,
            password: password,
            email: email,
        };

        const { createdUser } = await usersTestManager.createUser(userData, HttpStatus.CREATED_201, authBasicHeader);
        user = createdUser;
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(user).not.toBeNull();
    });

    it('should return an error when the "refresh" token has expired or there is no one in the cookie; status 401;', async () => {
        const data: AuthLoginInputDto = {
            loginOrEmail: login,
            password: password,
        };
        const tokenPair = await authTestManager.loginUser(data, HttpStatus.OK_200);
        if (!tokenPair) throw new Error('Test can not be performed');
        const rt = tokenPair.refreshToken;

        await testingProvider.getHttp().post(`/auth/refresh-token`).expect(HttpStatus.UNAUTHORIZED_401);

        // wait > refresh token lifetime
        await new Promise(resolve =>
            setTimeout(
                resolve,
                testingProvider.getDaoUtils().jwtService.intervalsInSeconds.refreshTokenLifetime * 1000 + 1,
            ),
        );
        await testingProvider
            .getHttp()
            .post(`/auth/refresh-token`)
            .set('cookie', 'refreshToken=' + rt)
            .expect(HttpStatus.UNAUTHORIZED_401);
    });
});