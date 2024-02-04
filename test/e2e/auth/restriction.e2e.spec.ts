import { RouterPaths } from '../../../src/application/types/router-paths';
import { HttpStatus } from '../../../src/application/types/types';
import { AppE2eTestingProvider, getTestingEnvironment } from '../../utils/get-testing-environment';

describe('testing ip restriction for registration', () => {
    const testingProvider: AppE2eTestingProvider = getTestingEnvironment();

    it('should return 429 error ', async () => {
        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: 'User16666',
                password: 'User16666',
                email: 'User1@mail.ru',
            })
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: 'User2666',
                password: 'User2666',
                email: 'User2@mail.ru',
            })
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: 'User3666',
                password: 'User3666',
                email: 'User3@mail.ru',
            })
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: 'User4666',
                password: 'User4666',
                email: 'User4@mail.ru',
            })
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: 'User5666',
                password: 'User5666',
                email: 'User5@mail.ru',
            })
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .post(`${RouterPaths.auth}/registration`)
            .set('Content-Type', 'application/json')
            .send({
                login: 'User6666',
                password: 'User6666',
                email: 'User6@mail.ru',
            })
            .expect(HttpStatus.TOO_MANY_REQUESTS_429);
    }, 50000);
});
