import request from 'supertest'
import {HTTP_STATUSES} from "../../../src/enums/http-statuses";
import {app} from "../../../src/app_settings";
import {RouterPaths} from "../../../src/helpers/router-paths";
import {
    authBasicHeader, clearDatabase,
    connectToDataBases,
    disconnectFromDataBases, generateString
} from "../../utils/test_utilities";
import {CreateUserInputModel} from "../../../src/models/user/create-input-user-model";
import {UserViewModel} from "../../../src/models/user/user-view-model";
import {usersTestManager} from "../../utils/usersTestManager";

describe('/Testing users', () => {

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    it('should return 401 without AUTH', async () => {
        await request(app)
            .get(RouterPaths.users)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })


    it('should return 200 and empty array', async () => {
        await request(app)
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('should not create user without AUTH', async () => {

        const data: CreateUserInputModel = {
            login: "Feynman",
            password: "Richard8=227",
            email: "Feynman1918@gmailya.com",
        }

        await usersTestManager.createUser(data, HTTP_STATUSES.UNAUTHORIZED_401)

        await request(app)
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    let createdUser1: UserViewModel | null = null;

    it(`shouldn't create user with AUTH and incorrect input data`, async () => {

        // Короткий логин
        const data1: CreateUserInputModel = {
            login: "12",
            password: "password123",
            email: "email@mail.com",
        }

        await usersTestManager.createUser(data1, HTTP_STATUSES.BAD_REQUEST_400, authBasicHeader)

        // Длинный логин
        const data2: CreateUserInputModel = {
            login: generateString(11),
            password: "password123",
            email: "email@mail.com",
        }

        await usersTestManager.createUser(data2, HTTP_STATUSES.BAD_REQUEST_400, authBasicHeader)
        // Запрещенный символ @ в логине
        const data3: CreateUserInputModel = {
            login: "bad_login@",
            password: "password123",
            email: "email@mail.com",
        }

        await usersTestManager.createUser(data3, HTTP_STATUSES.BAD_REQUEST_400, authBasicHeader)
        // Пароль короткий / длинный
        const data4: CreateUserInputModel = {
            login: "good_login",
            password: generateString(5),
            email: "email@mail.com",
        }

        await usersTestManager.createUser(data4, HTTP_STATUSES.BAD_REQUEST_400, authBasicHeader)

        const data5: CreateUserInputModel = {
            login: "good_login",
            password: generateString(21),
            email: "email@mail.com",
        }

        await usersTestManager.createUser(data5, HTTP_STATUSES.BAD_REQUEST_400, authBasicHeader)

        // Проверка email на соответствие регулярному выражению

        const data6: CreateUserInputModel = {
            login: "good_login",
            password: "password123",
            email: "email@mail.co.m",
        }

        await usersTestManager.createUser(data6, HTTP_STATUSES.BAD_REQUEST_400, authBasicHeader)

        await request(app)
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })


    it('should create user with AUTH and correct input data', async () => {

        const data: CreateUserInputModel = {
            login: "good_login",
            password: "password123",
            email: "email@mail.com",
        }

        const {createdUser} = await usersTestManager.createUser(data, HTTP_STATUSES.CREATED_201, authBasicHeader)

        createdUser1 = createdUser;
        if (!createdUser1) {
            throw new Error('test cannot be performed.');
        }

        await request(app)
            .get(RouterPaths.users)
            .set(authBasicHeader)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1, page: 1, pageSize: 10, totalCount: 1, items: [{
                    "id": createdUser1.id,
                    login: data.login,
                    email: data.email,
                    "createdAt": createdUser1.createdAt,
                }]
            })
    })

})
