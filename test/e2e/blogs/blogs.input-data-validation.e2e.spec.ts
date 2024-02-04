import { HttpStatus } from '../../../src/application/types/types';
import { authBasicHeader, generateString } from '../../utils/test_utilities';
import { AppE2eTestingProvider, getTestingEnvironment } from '../../utils/get-testing-environment';
import { RouterPaths } from '../../../src/application/types/router-paths';

describe(`blogs input data validation tests`, () => {
    const testingProvider: AppE2eTestingProvider = getTestingEnvironment();

    describe(`websiteUrl input validation tests`, () => {
        it(`shouldn't create entity with incorrect input data (websiteUrl is empty)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: 'name test',
                    description: 'description test',
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({ errorsMessages: [{ message: expect.any(String), field: 'websiteUrl' }] });
        });

        it(`shouldn't create entity with incorrect input data (websiteUrl length is over 100)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: 'name test',
                    description: 'description test',
                    websiteUrl: 'https://' + generateString(97) + '.com',
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({ errorsMessages: [{ message: expect.any(String), field: 'websiteUrl' }] });
        });

        it(`shouldn't create entity with incorrect input data (websiteUrl mask error)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: 'name test',
                    description: 'description test',
                    websiteUrl: "wrong url without top-level domain (TLD) like '.com'",
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({
                errorsMessages: [{ message: 'websiteUrl must be a URL address', field: 'websiteUrl' }],
            });
        });

        it(`should create entity with correct input data`, async () => {
            await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: 'name test',
                    description: 'description test',
                    websiteUrl: generateString(55) + '.com', // после resolve issue в class-validator про
                    // возможность прокидывать опцию {ignore_max_length: true} можно будет тестить
                    // длину на generateString(95) + '.com'
                })
                .expect(HttpStatus.CREATED_201);
        });
    });

    describe(`validation input name tests for /blogs`, () => {
        beforeAll(async () => {
            await testingProvider.getHttp().delete(RouterPaths.testing).set(authBasicHeader);
        });

        it(`shouldn't create entity with incorrect input data (name is empty)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: '',
                    description: 'description test',
                    websiteUrl: 'olololo.com',
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({ errorsMessages: [{ message: 'name should not be empty', field: 'name' }] });
        });

        it(`shouldn't create entity with incorrect input data (name length is over 100)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: generateString(16),
                    description: 'description test',
                    websiteUrl: 'olololo.com',
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({ errorsMessages: [{ message: expect.any(String), field: 'name' }] });
        });
    });

    describe(`validation input description tests for /blogs`, () => {
        beforeAll(async () => {
            await testingProvider.getHttp().delete(RouterPaths.testing).set(authBasicHeader);
        });

        it(`shouldn't create entity with incorrect input data (description is empty)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: 'name ok',
                    description: ' ',
                    websiteUrl: 'olololo.com',
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({
                errorsMessages: [{ message: 'description should not be empty', field: 'description' }],
            });
        });

        it(`shouldn't create entity with incorrect input data (description length is over 100)`, async () => {
            const response = await testingProvider
                .getHttp()
                .post(RouterPaths.blogs)
                .set(authBasicHeader)
                .send({
                    name: 'name ok',
                    description: generateString(501),
                    websiteUrl: 'olololo.com',
                })
                .expect(HttpStatus.BAD_REQUEST_400);
            expect(response.body).toEqual({
                errorsMessages: [
                    { message: 'description must be shorter than or equal to 500 characters', field: 'description' },
                ],
            });
        });
    });
});
