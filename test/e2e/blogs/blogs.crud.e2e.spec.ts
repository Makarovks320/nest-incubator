import { HttpStatus } from '../../../src/application/types/types';
import { RouterPaths } from '../../../src/application/types/router-paths';
import { AppE2eTestingProvider, getTestingEnvironment } from '../../utils/get-testing-environment';
import { BlogViewModel, CreateBlogInputModel, UpdateBlogInputModel } from '../../../src/features/blogs/types/dto';
import { blogsTestManager } from '../../utils/blogsTestManager';
import { authBasicHeader } from '../../utils/test_utilities';
import { ObjectId } from 'mongodb';

describe('/blogs tests', () => {
    const testingProvider: AppE2eTestingProvider = getTestingEnvironment();
    /* todo: почему так не работает?
    const http: SuperAgentTest = testingProvider.getHttp();
    beforeAll(async () => {
        await http.delete(RouterPaths.testing)
    });
 */

    it(`should return an object with 0 totalCount`, async () => {
        await testingProvider
            .getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });
    // create + read:
    let createdEntity1: BlogViewModel | null = null;
    it(`should create new entity with correct input data`, async () => {
        const data: CreateBlogInputModel = {
            //CreateBlogInputModel
            name: 'name test',
            description: 'description test',
            websiteUrl: 'http://test.ru',
        };

        const { createdBlog } = await blogsTestManager.createBlog(data, HttpStatus.CREATED_201);

        createdEntity1 = createdBlog;

        await testingProvider
            .getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdEntity1],
            });
    });

    // create + read another entity:
    let createdEntity2: BlogViewModel | null = null;
    it(`should create another new entity with correct input data`, async () => {
        const data: CreateBlogInputModel = {
            name: 'name test2',
            description: 'description test2',
            websiteUrl: 'http://test2.ru',
        };
        const { createdBlog } = await blogsTestManager.createBlog(data, HttpStatus.CREATED_201);

        createdEntity2 = createdBlog;

        await testingProvider
            .getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                //todo: почему такая последовательность?
                items: [createdEntity2, createdEntity1],
            });
    });

    // read by id:
    it(`should return correct entity by id`, async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }
        await testingProvider
            .getHttp()
            .get(`${RouterPaths.blogs}/${createdEntity1.id}`)
            .expect(HttpStatus.OK_200, createdEntity1);
    });

    // read by id (wrong id):
    it(`shouldn't find entity by wrong id`, async () => {
        const wrongIdNumber = new ObjectId().toString();
        await testingProvider.getHttp().get(`${RouterPaths.blogs}/${wrongIdNumber}`).expect(HttpStatus.NOT_FOUND_404);
    });

    // update:
    it(`should not update entity with incorrect auth credentials; status 401;`, async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }

        const data: UpdateBlogInputModel = {
            name: 'edited name a',
            description: 'description test',
            websiteUrl: 'http://test.ru',
        };

        await blogsTestManager.updateBlog(createdEntity1.id, data, HttpStatus.UNAUTHORIZED_401, {
            Authorization: 'bad',
        });

        await testingProvider
            .getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdEntity2, createdEntity1],
            });
    });

    it(`should update entity with correct input data`, async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }

        const data: UpdateBlogInputModel = {
            name: 'edited name a',
            description: 'description test',
            websiteUrl: 'http://test.ru',
        };

        await blogsTestManager.updateBlog(createdEntity1.id, data, HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdEntity2, { ...createdEntity1, name: data.name }],
            });
    });

    //delete by id:
    it('should delete entity by id', async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }

        await testingProvider
            .getHttp()
            .delete(`${RouterPaths.blogs}/${createdEntity1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider
            .getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdEntity2],
            });
    });
});
