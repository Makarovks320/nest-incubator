import { HttpStatus } from '../../../src/application/types/types';
import { JwtService } from '../../../src/application/adapters/jwt-service';
import { UserViewModel } from '../../../src/features/users/types/user-view-model';
import { PasswordRecoveryType, UserDocument } from '../../../src/features/users/03-domain/user-db-model';
import { CreateUserInputModel } from '../../../src/features/users/types/create-input-user-model';
import { usersTestManager } from '../../utils/usersTestManager';
import { RouterPaths } from '../../../src/application/types/router-paths';
import { UsersRepository } from '../../../src/features/users/04-repositories/users-repository';
import { authBasicHeader } from '../../utils/test_utilities';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from '../../utils/arrange-testing-environment';

// const emailAdapter = {
//     async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
//         return true;
//     }
// }

describe('testing password recovery', () => {
    const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();

    let jwtService: JwtService;
    let usersRepository: UsersRepository;

    // изначальные credentials
    const email: string = 'email123@mail.com';
    const login: string = 'login1';
    const passwordBeforeChanging: string = 'password123';
    // сюда сохраним юзера
    let user: UserViewModel | null = null;
    // сюда сохраним объект с кодом восстановления
    let passwordRecovery: PasswordRecoveryType | null = null;
    // новый пароль
    const newPassword: string = 'goodNewPassword';

    beforeAll(async () => {
        // Создаем юзера
        const userData: CreateUserInputModel = {
            login: login,
            password: passwordBeforeChanging,
            email: email,
        };

        const { createdUser } = await usersTestManager.createUser(userData, HttpStatus.CREATED_201, authBasicHeader);
        user = createdUser;
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(user).not.toBeNull();
    });

    it('should return status 204 even if such email doesnt exist; status 204;', async () => {
        const data = {
            email: 'unexistingEmailAddress@jopa.com',
        };

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/password-recovery`)
            .send(data)
            .expect(HttpStatus.NO_CONTENT_204);
    });

    it('should send email with correct recovery code', async () => {
        //todo: Как правильно замокать?
        // const spyForSendEmail = jest.spyOn(emailAdapter, 'sendEmail');
        // const isPlaying = await emailAdapter.sendEmail('a', 'b', 'c');

        if (!user) throw new Error('test cannot be performed.');
        const userDB: UserDocument | null = await usersRepository.findUserByLoginOrEmail(user.email);
        if (!userDB) throw new Error('test cannot be performed.');

        const data = {
            email: 'email123@mail.com',
        };

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/password-recovery`)
            .send(data)
            .expect(HttpStatus.NO_CONTENT_204);

        // expect(spyForSendEmail).toHaveBeenCalled();
        // expect(isPlaying).toBe(true);

        // Response получен, теперь проверим, что код сохранился верный.
        const userWithCreatedPasswordRecoveryCode: UserDocument | null = await usersRepository.findUserByLoginOrEmail(
            data.email,
        );

        if (!userWithCreatedPasswordRecoveryCode) throw new Error('test cannot be performed.');

        // Заодно сохраним код для последующих тестов
        passwordRecovery = userWithCreatedPasswordRecoveryCode.passwordRecovery;

        // проверим код на корректность
        const restoredUserDb_id = await jwtService.getUserIdByToken(passwordRecovery.passwordRecoveryCode);
        expect(userDB._id).toEqual(restoredUserDb_id);
        expect(passwordRecovery.active).toEqual(false);
    });

    it('should return error if password is incorrect; status 400;', async () => {
        if (!passwordRecovery) throw new Error('test cannot be performed.');

        const data = {
            newPassword: 'short',
            recoveryCode: passwordRecovery.passwordRecoveryCode,
        };

        const response = await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/new-password`)
            .send(data)
            .expect(HttpStatus.BAD_REQUEST_400);
        expect(response.body).toEqual({
            errorsMessages: [{ message: expect.any(String), field: 'newPassword' }],
        });
    });

    it('should return error if recoveryCode is incorrect; status 400;', async () => {
        const data = {
            newPassword: newPassword,
            recoveryCode: 'wrong recovery code',
        };

        const response = await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/new-password`)
            .send(data)
            .expect(HttpStatus.BAD_REQUEST_400);
        expect(response.body).toEqual({
            errorsMessages: [{ message: expect.any(String), field: 'recoveryCode' }],
        });
    });

    it('should confirm password recovery; status 204;', async () => {
        if (!passwordRecovery) throw new Error('test cannot be performed.');

        const data = {
            newPassword: newPassword,
            recoveryCode: passwordRecovery.passwordRecoveryCode,
        };

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/new-password`)
            .send(data)
            .expect(HttpStatus.NO_CONTENT_204);
    });

    it('should return status 401 if try to login with old password; status 401;', async () => {
        const data = {
            loginOrEmail: email,
            password: passwordBeforeChanging,
        };

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/login`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED_401);
    });

    it('should sign in user with new password; status 200; content: JWT token;', async () => {
        const data = {
            loginOrEmail: email,
            password: newPassword,
        };

        const response = await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/login`)
            .send(data)
            .expect(HttpStatus.OK_200);
        expect(response.body.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);
    });
});

// todo:
// замокать сервис почты (в джесте есть механизм Мокания данных)
// const sendEmailConfirmation =
//     jest.spyOn(EmailAdapter.prototype, 'sendEmail')
//         .mockReturnValue(fakeSendEmail);
//
// const fakeSendEmail() : Promise<boolean> {
//     return Promise.resolve(true);
// }
//
// expect(sendEmailConfirmation).toHaveBeenCalledWith()
