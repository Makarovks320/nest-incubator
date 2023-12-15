import request from "supertest";
import {app} from "../../../src/app_settings";
import {RouterPaths} from "../../../src/helpers/router-paths";
import {
    authBasicHeader,
    clearDatabase,
    connectToDataBases,
    disconnectFromDataBases,
    generateString
} from "../../utils/test_utilities";
import {HTTP_STATUSES} from "../../../src/enums/http-statuses";

describe(`websiteUrl input validation tests`, () => {

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    it(`shouldn't create entity with incorrect input data (websiteUrl is empty)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: "name test",
                description: "description test"
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({errorsMessages: [
                { message: expect.any(String), field: 'websiteUrl' }
            ]});
    });

    it(`shouldn't create entity with incorrect input data (websiteUrl length is over 100)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: "name test",
                description: "description test",
                websiteUrl: generateString(97) + '.com'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({errorsMessages: [
                { message: 'max length is 100', field: 'websiteUrl' }
            ]});
    });

    it(`shouldn't create entity with incorrect input data (websiteUrl mask error)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: "name test",
                description: "description test",
                websiteUrl: "wrong url without top-level domain (TLD) like '.com'"
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({errorsMessages: [
                { message: 'websiteUrl should be url', field: 'websiteUrl' }
            ]});
    });


    it(`should create entity with correct input data`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: "name test",
                description: "description test",
                websiteUrl: generateString(95) + '.com'
            })
            .expect(HTTP_STATUSES.CREATED_201);
    });
});


describe(`validation input name tests for /blogs`, () => {
    beforeAll(async () => {
        await request(app).delete(RouterPaths.testing).set(authBasicHeader);
    });

    it(`shouldn't create entity with incorrect input data (name is empty)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: "",
                description: "description test",
                websiteUrl: 'olololo.com'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({errorsMessages: [
                { message: 'should not be empty', field: 'name' }
            ]});
    });

    it(`shouldn't create entity with incorrect input data (name length is over 100)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: generateString(16),
                description: "description test",
                websiteUrl: 'olololo.com'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({errorsMessages: [
                { message: 'max length is 15', field: 'name' }
            ]});
    });
});


describe(`validation input description tests for /blogs`, () => {
    beforeAll(async () => {
        await request(app).delete(RouterPaths.testing).set(authBasicHeader);
    });

    it(`shouldn't create entity with incorrect input data (description is empty)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: "name ok",
                description: " ",
                websiteUrl: 'olololo.com'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({
            errorsMessages: [
                {message: 'should not be empty', field: 'description'}
            ]
        });
    });

    it(`shouldn't create entity with incorrect input data (description length is over 100)`, async () => {
        const response = await request(app)
            .post(RouterPaths.blogs)
            .set(authBasicHeader)
            .send({
                name: 'name ok',
                description: generateString(501),
                websiteUrl: 'olololo.com'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400);
        expect(response.body).toEqual({
            errorsMessages: [
                {message: 'max length is 500', field: 'description'}
            ]
        });
    });
});
