import request from "supertest";
import {app} from "../../../src/app_settings";
import {RouterPaths} from "../../../src/helpers/router-paths";
import {HTTP_STATUSES} from "../../../src/enums/http-statuses";
import {authBasicHeader, clearDatabase, connectToDataBases, disconnectFromDataBases} from "../../utils/test_utilities";
import {blogsTestManager} from "../../utils/blogsTestManager";
import {CreateBlogInputModel} from "../../../src/models/blog/create-input-blog-model";
import {BlogViewModel} from "../../../src/models/blog/blog-view-model";
import {PostViewModel} from "../../../src/models/post/post-view-model";
import {CreatePostInputModel} from "../../../src/models/post/create-post-input-model";
import {postsTestManager} from "../../utils/postsTestManager";
import {ObjectId} from "mongodb";


describe('CRUD tests for /posts', () => {

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    it('should return an object with 0 totalCount', async () => {
        await request(app)
            .get(RouterPaths.posts)
            .expect(HTTP_STATUSES.OK_200,{ pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it(`shouldn't create post for unexisting blogId`, async () => {
        await request(app)
            .post(RouterPaths.posts)
            .set(authBasicHeader)
            .send({
                "title": "title 1",
                "content": "content 1",
                "shortDescription": "some short description",
                "blogId": "wrong blog id"
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400,{
                errorsMessages: [ { message: 'blog is not found', field: 'blogId' } ]
            });
    });

    // create blog + create post for blog
    let createdBlogForPost: BlogViewModel | null = null;
    let createdPost1: PostViewModel | null = null;
    it('should create new post for existing blogId', async () => {
        // сначала создадим блог
        const blogData: CreateBlogInputModel = {
            name: "name test2",
            description: "description test 2",
            websiteUrl: "http://test.ru"
        };
        const {createdBlog} = await blogsTestManager.createBlog(blogData, HTTP_STATUSES.CREATED_201);
        createdBlogForPost = createdBlog;
        if (!createdBlogForPost) {
            throw new Error('test cannot be performed.');
        }
        //создадим пост для createdBlog.id
        const postData: CreatePostInputModel = {
            "title": "title 1",
            "content": "content 1",
            "shortDescription": "some short description",
            "blogId": createdBlogForPost.id
        }

        const {createdPost} = await postsTestManager.createPost(postData, HTTP_STATUSES.CREATED_201);
        createdPost1 = createdPost;
    });

    // create another post by '/blogs' router
    let createdPost2: PostViewModel | null = null;
    it('should create another post for the same blog', async () => {
        if (!createdBlogForPost) {
            throw new Error('test cannot be performed.');
        }

        const postData: CreatePostInputModel = {
            "title": "title 2",
            "content": "content 2",
            "shortDescription": "some short description 2",
            "blogId": createdBlogForPost.id
        }

        const {createdPost} = await postsTestManager.createPost(postData, HTTP_STATUSES.CREATED_201, true);
        createdPost2 = createdPost;
    })

    // update post
    let updatedPost1: PostViewModel | null = null;
    it('should not update post if :id from uri param not found; status 404; ', async () => {
        if (!createdPost1 || !createdBlogForPost) throw new Error('test cannot be performed.');
        const updatedPostData: CreatePostInputModel = {
            "title": "updated title 2",
            "content": "updated content 2",
            "shortDescription": "updated some short description 2",
            "blogId": createdBlogForPost.id
        }

        await postsTestManager.updatePost((new ObjectId()).toString(), updatedPostData, HTTP_STATUSES.NOT_FOUND_404);

        await postsTestManager.updatePost('unoformatted wrong id', updatedPostData, HTTP_STATUSES.NOT_FOUND_404);

        await request(app)
            .get(`${RouterPaths.blogs}/${createdBlogForPost.id}/posts`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost2, createdPost1]
            });
    })

    it('should update post', async () => {
        if (!createdPost1 || !createdBlogForPost) throw new Error('test cannot be performed.');
        const updatedPostData: CreatePostInputModel = {
            "title": "updated title 2",
            "content": "updated content 2",
            "shortDescription": "updated some short description 2",
            "blogId": createdBlogForPost.id
        }

        await postsTestManager.updatePost(createdPost1.id.toString(), updatedPostData, HTTP_STATUSES.NO_CONTENT_204);

        await request(app)
            .get(`${RouterPaths.blogs}/${createdBlogForPost.id}/posts`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost2, {...createdPost1, ...updatedPostData}]
            });
    })

    // create another blog + post
    let createdBlogForPost2: BlogViewModel | null = null;
    let createdPost3: PostViewModel | null = null;
    it('should get posts by special blog', async () => {
        const blogData: CreateBlogInputModel = {
            name: "name test3",
            description: "description test 3",
            websiteUrl: "http://test.ru"
        };
        const {createdBlog} = await blogsTestManager.createBlog(blogData, HTTP_STATUSES.CREATED_201);
        createdBlogForPost2 = createdBlog;
        if (!createdBlogForPost || !createdBlogForPost2) {
            throw new Error('test cannot be performed.');
        }
        //создадим пост для второго блога
        const postData: CreatePostInputModel = {
            "title": "title 3",
            "content": "content 3",
            "shortDescription": "some short description",
            "blogId": createdBlogForPost2.id
        }

        const {createdPost} = await postsTestManager.createPost(postData, HTTP_STATUSES.CREATED_201);
        createdPost3 = createdPost;

        await request(app)
            .get(`${RouterPaths.posts}`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost3, createdPost2, createdPost1]
            });

        await request(app)
            .get(`${RouterPaths.blogs}/${createdBlogForPost.id}/posts`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost2, createdPost1]
            });

        await request(app)
            .get(`${RouterPaths.blogs}/${createdBlogForPost2.id}/posts`)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost3]
            });
    });
});