import request from 'supertest';
import {app} from "../../../src/app_settings";
import {RouterPaths} from "../../../src/helpers/router-paths";
import {authBasicHeader, clearDatabase, connectToDataBases, disconnectFromDataBases} from "../../utils/test_utilities";
import {HTTP_STATUSES} from "../../../src/enums/http-statuses";
import {CreateBlogInputModel} from "../../../src/models/blog/create-input-blog-model";
import {BlogViewModel} from "../../../src/models/blog/blog-view-model";
import {blogsTestManager} from "../../utils/blogsTestManager";
import {UpdateInputBlogModel} from "../../../src/models/blog/update-input-blog-model";

describe(`CRUD tests for /blogs`, () => {

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    it(`should return an object with 0 totalCount`, async () => {
        await request(app)
            .get(RouterPaths.blogs)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []});
    });

    // create + read:
    let createdEntity1: BlogViewModel | null = null;
    it(`should create new entity with correct input data`, async () => {
        const data: CreateBlogInputModel = {
            name: "name test",
            description: "description test",
            websiteUrl: "http://test.ru"
        }

        const {createdBlog} = await blogsTestManager.createBlog(data, HTTP_STATUSES.CREATED_201);

        createdEntity1 = createdBlog;

        await request(app)
            .get(RouterPaths.blogs)
            .expect(HTTP_STATUSES.OK_200, {
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
        const {createdBlog} = await blogsTestManager.createBlog(data, HTTP_STATUSES.CREATED_201);

        createdEntity2 = createdBlog;

        await request(app)
            .get(RouterPaths.blogs)
            .expect(HTTP_STATUSES.OK_200, {
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
        await request(app)
            .get(`${RouterPaths.blogs}/${createdEntity1.id}`)
            .expect(HTTP_STATUSES.OK_200, createdEntity1);
    });

    // read by id (wrong id):
    it(`shouldn't find entity by wrong id`, async () => {
        await request(app)
            .get(`${RouterPaths.blogs}/wrong-id-number`)
            .expect(HTTP_STATUSES.NOT_FOUND_404);
    });

    // update:
    it(`should update entity with correct input data`, async () => {
        if (!createdEntity1) {
            throw new Error('test cannot be performed.');
        }

        const data: UpdateInputBlogModel = {
            name: "edited name a",
            description: "description test",
            websiteUrl: "http://test.ru"
        };

        await request(app)
            .put(`${RouterPaths.blogs}/${createdEntity1.id}`,)
            .set(authBasicHeader)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204);

        await request(app)
            .get(RouterPaths.blogs)
            .expect(HTTP_STATUSES.OK_200, {
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

        await request(app)
            .delete(`${RouterPaths.blogs}/${createdEntity1.id}`)
            .set(authBasicHeader)
            .expect(HTTP_STATUSES.NO_CONTENT_204);
        
        await request(app)
            .get(RouterPaths.blogs)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdEntity2]
            });
    })
});

