import request from 'supertest'
import {HTTP_STATUSES} from "../../src/enums/http-statuses";
import {app} from "../../src/app_settings";
import {
    authBasicHeader,
    clearDatabase,
    connectToDataBases,
    disconnectFromDataBases
} from "../utils/test_utilities";
import {RouterPaths} from "../../src/helpers/router-paths";
import {CreateUserInputModel} from "../../src/models/user/create-input-user-model";
import {UserViewModel} from "../../src/models/user/user-view-model";
import {usersTestManager} from "../utils/usersTestManager";
import {PasswordRecoveryType, UserDBModel, UserModel} from "../../src/models/user/user-db-model";
import {EmailAdapter} from "../../src/adapters/email-adapter";
import {container} from "../../src/composition-root";
import {UsersRepository} from "../../src/repositories/users-repository";
import {JwtService} from "../../src/application/jwt-service";

const emailAdapter = {
    async sendEmail(email: string, subject: string, message: string): Promise<boolean> {
        return true;
    }
}

const jwtService = container.resolve(JwtService);
const usersRepository = container.resolve(UsersRepository);

describe('testing password recovery', () => {

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    afterAll(() => {
        // restore the spy created with spyOn
        jest.restoreAllMocks();
    });

    // const isPlaying = video.play();
    //
    // expect(spy).toHaveBeenCalled();
    // expect(isPlaying).toBe(true);

    // изначальные credentials
    const email: string = "email123@mail.com";
    const passwordBeforeChanging: string = "password123";
    // сюда сохраним юзера
    let user: UserViewModel | null = null;
    // сюда сохраним объект с кодом восстановления
    let passwordRecovery: PasswordRecoveryType | null = null;
    // новый пароль
    const newPassword: string = 'goodNewPassword';

    beforeAll(async () => {
        // Создаем юзера
        const userData: CreateUserInputModel = {
            login: "login1",
            password: passwordBeforeChanging,
            email: email
        }

        const {createdUser} = await usersTestManager.createUser(userData, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user = createdUser;
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(user).not.toBeNull();
    })

    it('should return status 204 even if such email doesnt exist; status 204;', async() => {

        const data = {
            'email': 'unexistingEmailAddress@jopa.com'
        }

        await request(app)
            .post(`${RouterPaths.auth}/password-recovery`)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    });

    it('should send email with correct recovery code', async () => {
        //todo: Как правильно замокать?
        //@ts-ignore
        const spyForSendEmail = jest.spyOn(emailAdapter, 'sendEmail');
        const isPlaying = await emailAdapter.sendEmail('a', 'b', 'c');

        if (!user) throw new Error('test cannot be performed.');
        const userDB: UserDBModel | null = await usersRepository.findUserByLoginOrEmail(user.email);
        if (!userDB) throw new Error('test cannot be performed.');

        const data = {
            'email': 'email123@mail.com'
        }

        await request(app)
            .post(`${RouterPaths.auth}/password-recovery`)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        expect(spyForSendEmail).toHaveBeenCalled();
        expect(isPlaying).toBe(true);

        // Response получен, теперь проверим, что код сохранился верный.
        const userWithCreatedPasswordRecoveryCode: UserDBModel | null = await UserModel.findOne({'accountData.email': data.email})
            .select('passwordRecovery')
            .lean();

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
            'newPassword': 'short',
            'recoveryCode': passwordRecovery.passwordRecoveryCode
        }

        const response = await request(app)
            .post(`${RouterPaths.auth}/new-password`)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
        expect(response.body).toEqual({errorsMessages: [
                { message: expect.any(String), field: 'newPassword' }
            ]});
    });

    it('should return error if recoveryCode is incorrect; status 400;', async () => {
        const data = {
            'newPassword': newPassword,
            'recoveryCode': 'wrong recovery code'
        }

        const response = await request(app)
            .post(`${RouterPaths.auth}/new-password`)
            .send(data)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
        expect(response.body).toEqual({errorsMessages: [
                { message: expect.any(String), field: 'recoveryCode' }
            ]});
    });


    it('should confirm password recovery; status 204;', async () => {
        if (!passwordRecovery) throw new Error('test cannot be performed.');

        const data = {
            'newPassword': newPassword,
            'recoveryCode': passwordRecovery.passwordRecoveryCode
        }

        await request(app)
            .post(`${RouterPaths.auth}/new-password`)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    });

    it('should return status 401 if try to login with old password; status 401;', async () => {
        const data = {
            'loginOrEmail': email,
            'password': passwordBeforeChanging
        }

        await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send(data)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    });

    it('should sign in user with new password; status 200; content: JWT token;', async () => {
        const data = {
            'loginOrEmail': email,
            'password': newPassword
        }

        const response = await request(app)
            .post(`${RouterPaths.auth}/login`)
            .send(data)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body.accessToken).toMatch(/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_.+/=]*$/);
    });
})

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