import request from 'supertest'
import {HTTP_STATUSES} from "../../src/enums/http-statuses";
import {app} from "../../src/app_settings";
import {Response} from "supertest";
import {clearDatabase, connectToDataBases, disconnectFromDataBases} from "../utils/test_utilities";
import {RouterPaths} from "../../src/helpers/router-paths";

describe('testing ip restriction for registration', () => {

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    it("should return 429 error ", async () => {

        const res1: Response = await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: "User16666",
                password: "User16666",
                email: "User1@mail.ru"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res2: Response = await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: "User2666",
                password: "User2666",
                email: "User2@mail.ru"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res3: Response = await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: "User3666",
                password: "User3666",
                email: "User3@mail.ru"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res4: Response = await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: "User4666",
                password: "User4666",
                email: "User4@mail.ru"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res5: Response = await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: "User5666",
                password: "User5666",
                email: "User5@mail.ru"
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        const res6: Response = await request(app)
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: "User6666",
                password: "User6666",
                email: "User6@mail.ru"
            })
            .expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429);

    }, 50000)
})

