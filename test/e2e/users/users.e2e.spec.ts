import { HttpStatus } from '../../../src/application/types/types';
import { authBasicHeader, generateString } from '../../utils/test_utilities';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from '../../utils/arrange-testing-environment';
import { RouterPaths } from '../../../src/application/types/router-paths';
import { usersTestManager } from '../../utils/usersTestManager';
import { UserViewModel } from '../../../src/features/users/types/user-view-model';
import { CreateUserInputDto } from '../../../src/features/users/05-dto/CreateUserInputDto';

describe('/Testing users', () => {
    const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();

    it('should return 401 without AUTH', async () => {
        await testingProvider.getHttp().get(RouterPaths.users).expect(HttpStatus.UNAUTHORIZED_401);
    });

    it('should return 200 and empty array', async () => {
        await testingProvider
            .getHttp()
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it('should not create user without AUTH', async () => {
        const data: CreateUserInputDto = {
            login: 'Feynman',
            password: 'Richard8=227',
            email: 'Feynman1918@gmailya.com',
        };

        await usersTestManager.createUser(data, HttpStatus.UNAUTHORIZED_401);

        await testingProvider
            .getHttp()
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    let createdUser1: UserViewModel | null = null;

    it(`shouldn't create user with AUTH and incorrect input data`, async () => {
        // Короткий логин
        const data1: CreateUserInputDto = {
            login: '12',
            password: 'password123',
            email: 'email@mail.com',
        };

        await usersTestManager.createUser(data1, HttpStatus.BAD_REQUEST_400, authBasicHeader, 'login');

        // Длинный логин
        const data2: CreateUserInputDto = {
            login: generateString(11),
            password: 'password123',
            email: 'email@mail.com',
        };
        await usersTestManager.createUser(data2, HttpStatus.BAD_REQUEST_400, authBasicHeader, 'login');

        // Запрещенный символ @ в логине
        const data3: CreateUserInputDto = {
            login: 'bad_login_@',
            password: 'password123',
            email: 'email@mail.com',
        };
        await usersTestManager.createUser(data3, HttpStatus.BAD_REQUEST_400, authBasicHeader, 'login');

        // Пароль короткий
        const data4: CreateUserInputDto = {
            login: 'good_login',
            password: generateString(5),
            email: 'email@mail.com',
        };
        await usersTestManager.createUser(data4, HttpStatus.BAD_REQUEST_400, authBasicHeader, 'password');

        // Пароль длинный
        const data5: CreateUserInputDto = {
            login: 'good_login',
            password: generateString(21),
            email: 'email@mail.com',
        };
        await usersTestManager.createUser(data5, HttpStatus.BAD_REQUEST_400, authBasicHeader, 'password');

        // email не соответствует регулярному выражению
        const data6: CreateUserInputDto = {
            login: 'good_login',
            password: 'password123',
            email: 'email@mail.co.m',
        };
        await usersTestManager.createUser(data6, HttpStatus.BAD_REQUEST_400, authBasicHeader, 'email');

        await testingProvider
            .getHttp()
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it('should create user with AUTH and correct input data', async () => {
        const data: CreateUserInputDto = {
            login: 'good_login',
            password: 'password123',
            email: 'email@mail.com',
        };

        const { createdUser } = await usersTestManager.createUser(data, HttpStatus.CREATED_201, authBasicHeader);

        createdUser1 = createdUser;
        if (!createdUser1) {
            throw new Error('test cannot be performed.');
        }

        await testingProvider
            .getHttp()
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [
                    {
                        id: createdUser1.id,
                        login: data.login,
                        email: data.email,
                        createdAt: createdUser1.createdAt,
                    },
                ],
            });
    });
});
