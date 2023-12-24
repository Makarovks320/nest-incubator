import { HttpStatus } from '../../../src/common/types';
import { RouterPaths } from '../../../src/application/utils/router-paths';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from '../../utils/arrange-testing-environment';
import { BlogViewModel, CreateBlogInputModel, UpdateBlogInputDto } from '../../../src/features/blogs/types/dto';
import { blogsTestManager } from '../../utils/blogsTestManager';
import { authBasicHeader } from '../../utils/test_utilities';

describe('/blogs tests', () => {
    const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();
/* todo: почему так не работает?
    const http: SuperAgentTest = testingProvider.getHttp();
    beforeAll(async () => {
        await http.delete(RouterPaths.testing)
    });
 */

    it(`should return an object with 0 totalCount`, async () => {
        await testingProvider.getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []});
    });
    // create + read:
    let createdEntity1: BlogViewModel | null = null;
    it(`should create new entity with correct input data`, async () => {
        const data: CreateBlogInputModel = { //CreateBlogInputModel
            name: "name test",
            description: "description test",
            websiteUrl: "http://test.ru"
        }

        const {createdBlog} = await blogsTestManager.createBlog(data, HttpStatus.CREATED_201);

        createdEntity1 = createdBlog;

        await testingProvider.getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdEntity1]
            });
    });


    // create + read another entity:
    let createdEntity2: BlogViewModel | null = null;
    it(`should create another new entity with correct input data`, async () => {
        const data: CreateBlogInputModel = {
            name: "name test2",
            description: "description test2",
            websiteUrl: "http://test2.ru"
        }
        const {createdBlog} = await blogsTestManager.createBlog(data, HttpStatus.CREATED_201);

        createdEntity2 = createdBlog;

        await testingProvider.getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                //todo: почему такая последовательность?
                items: [createdEntity2, createdEntity1]
            });
    });

    // read by id:
    it(`should return correct entity by id`, async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }
        await testingProvider.getHttp()
            .get(`${RouterPaths.blogs}/${createdEntity1.id}`)
            .expect(HttpStatus.OK_200, createdEntity1);
    });

    // read by id (wrong id):
    it(`shouldn't find entity by wrong id`, async () => {
        await testingProvider.getHttp()
            // .get(`${RouterPaths.blogs}/41224d776a326fb40f000001`)
            //todo: если неподходящий для формат, ошибка: Cast to ObjectId failed for value "wrong-id-number"
            .get(`${RouterPaths.blogs}/wrong-id-number`)
            .expect(HttpStatus.NOT_FOUND_404);
    });

    // update:
    it(`should update entity with correct input data`, async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }

        const data: UpdateBlogInputDto = {
            name: "edited name a",
            description: "description test",
            websiteUrl: "http://test.ru"
        };

        await testingProvider.getHttp()
            .put(`${RouterPaths.blogs}/${createdEntity1.id}`,)
            .set(authBasicHeader)
            .send(data)
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider.getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [ createdEntity2, { ...createdEntity1, name: data.name } ]
            });
    });

    //delete by id:
    it('should delete entity by id', async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }

        await testingProvider.getHttp()
            .delete(`${RouterPaths.blogs}/${createdEntity1.id}`)
            .set(authBasicHeader)
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider.getHttp()
            .get(RouterPaths.blogs)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdEntity2]
            });
    })
});
