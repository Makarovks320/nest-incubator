import request from 'supertest'

import {HTTP_STATUSES} from "../../../src/enums/http-statuses";
import {CreateBlogInputModel} from "../../../src/models/blog/create-input-blog-model";
import {app} from "../../../src/app_settings";
import {RouterPaths} from "../../../src/helpers/router-paths";
import {blogsTestManager} from "../../utils/blogsTestManager";
import {
    authBasicHeader,
    clearDatabase,
    connectToDataBases, disconnectFromDataBases,
    generateString
} from "../../utils/test_utilities";
import {PostViewModel} from "../../../src/models/post/post-view-model";
import {CreatePostInputModel} from "../../../src/models/post/create-post-input-model";
import {postsTestManager} from "../../utils/postsTestManager";
import {CreateUserInputModel} from "../../../src/models/user/create-input-user-model";
import {UserViewModel} from "../../../src/models/user/user-view-model";
import {usersTestManager} from "../../utils/usersTestManager";
import {BlogViewModel} from "../../../src/models/blog/blog-view-model";
import {CommentViewModel} from "../../../src/models/comment/comment-view-model";
import {CreateCommentInputModel} from "../../../src/models/comment/create-input-comment-model";
import {commentsTestManager} from "../../utils/commentsTestManager";
import {container} from "../../../src/composition-root";
import mongoose from "mongoose";
import {JwtService} from "../../../src/application/jwt-service";

jest.setTimeout(10000)

const jwtService = container.resolve(JwtService);
describe('tests for comments', () => {
    let post: PostViewModel | null;
    let user1: UserViewModel | null;
    let user2: UserViewModel | null;
    let blog: BlogViewModel | null;
    let authJWTHeader1: {};
    let authJWTHeader2: {};

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);

    beforeAll(async () => {
        // Создаем блог, к которому будем прикреплять пост
        const dataBlog: CreateBlogInputModel = {
            "name": "Richard Feynman",
            "description": "Bingo article about Richard Feynman",
            "websiteUrl": "https://telegra.ph/Richard-Feynman-05-11",
        }

        const {createdBlog} = await blogsTestManager.createBlog(dataBlog, HTTP_STATUSES.CREATED_201)
        if (!createdBlog) throw new Error('test cannot be performed.');

        blog = createdBlog;

        // Создаем пост, к которому будем прикреплять комменты
        const dataPost: CreatePostInputModel = {
            "title": "amazing Math_1",
            "shortDescription": "Short description about new amazing Math_1 course",
            "content": "Math_1 Math_1 Math_1 Math_1 Math_1 Math_1",
            "blogId": createdBlog.id,
        }

        const {createdPost} = await postsTestManager.createPost(dataPost, HTTP_STATUSES.CREATED_201)
        post = createdPost

        //Создаем юзера1, чтобы оставлять комменты

        const dataUser: CreateUserInputModel = {
            "login": "User01",
            "password": "Password01",
            "email": "email01@fishmail2dd.com",
        }

        const {createdUser: createdUser1} = await usersTestManager.createUser(dataUser, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user1 = createdUser1;
        if (!user1) throw new Error('test cannot be performed.');

        const user1ObjectId = new mongoose.Types.ObjectId(user1.id);

        const AccessToken1 = await jwtService.createAccessToken(user1ObjectId)
        authJWTHeader1 = {Authorization: `Bearer ${AccessToken1}`}

        //Создаем юзера2, чтобы оставлять комменты

        const dataUser2: CreateUserInputModel = {
            "login": "User02",
            "password": "Password02",
            "email": "email02@fishmail3dd.com",
        }

        const {createdUser: createdUser2} = await usersTestManager.createUser(dataUser2, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user2 = createdUser2;
        if (!user2) throw new Error('test cannot be performed.');

        const user2ObjectId = new mongoose.Types.ObjectId(user2.id);

        const AccessToken2 = await jwtService.createAccessToken(user2ObjectId);
        authJWTHeader2 = {Authorization: `Bearer ${AccessToken2}`}

    })

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post).not.toBeNull();
        expect(user1).not.toBeNull();
    })


    it('should return 404 for not existing comment', async () => {
        await request(app)
            .get(`${RouterPaths.comments}/111111111111`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('should return empty array', async () => {
        if (!post) throw new Error('test cannot be performed.');

        await request(app)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })

    it('should not create comment without AUTH', async () => {
        if (!post) throw new Error('test cannot be performed.');

        const data: CreateCommentInputModel = {
            content: "Absolutely new comment"
        }

        await commentsTestManager.createComment(post.id, data, HTTP_STATUSES.UNAUTHORIZED_401)


        await request(app)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })


    it('should not create comment without content', async () => {
        if (!post) throw new Error('test cannot be performed.');

        const data: CreateCommentInputModel = {
            content: ""
        }

        await commentsTestManager.createComment(post.id, data, HTTP_STATUSES.BAD_REQUEST_400, authJWTHeader1)

        await request(app)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HTTP_STATUSES.OK_200, {pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: []})
    })


    // Создаем первый коммент от первого юзера

    let comment_1: CommentViewModel | null = null;

    it('should create comment 1', async () => {
        if (!post) throw new Error('test cannot be performed.');

        const data: CreateCommentInputModel = {
            content: "I just called to say I love you"
        }

        const {createdComment} = await commentsTestManager.createComment(post.id, data, HTTP_STATUSES.CREATED_201, authJWTHeader1)

        comment_1 = createdComment;

        if (!comment_1) throw new Error('test cannot be performed.');

        const response = await request(app)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HTTP_STATUSES.OK_200);
        const body = response.body;
        expect(body).toEqual({
            pagesCount: 1, page: 1, pageSize: 10, totalCount: 1, items: [{
                id: comment_1.id,
                content: data.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: expect.any(Object)
            }]
        })
    })


    // Создаем второй коммент от первого юзера

    let comment_2: CommentViewModel | null = null;

    it('should create comment 2', async () => {
        if (!post) throw new Error('test cannot be performed.');

        const data: CreateCommentInputModel = {
            content: "I just called to say I love you 2"
        }

        const {createdComment} = await commentsTestManager.createComment(post.id, data, HTTP_STATUSES.CREATED_201, authJWTHeader2)

        comment_2 = createdComment;

        if (!comment_1 || !comment_2) throw new Error('test cannot be performed.');

        const response = await request(app)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            pagesCount: 1, page: 1, pageSize: 10, totalCount: 2, items: [
                {
                    id: comment_2.id,
                    content: data.content,
                    commentatorInfo: comment_2.commentatorInfo,
                    createdAt: comment_2.createdAt,
                    likesInfo: expect.any(Object)
                }, {
                    id: comment_1.id,
                    content: comment_1.content,
                    commentatorInfo: comment_1.commentatorInfo,
                    createdAt: comment_1.createdAt,
                    likesInfo: expect.any(Object)
                }]
        })
    });

    it('should not update comment 1 without AUTH', async () => {
        if (!comment_1) throw new Error('test cannot be performed.');
        const data: CreateCommentInputModel = {
            content: "NEW OUTSTANDING UPDATED COMMENT 1"
        }

        await request(app)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .send(data)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)

        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.OK_200);

        expect(response.body).toEqual({
            id: comment_1.id,
            content: comment_1.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object)
        })
    });

    it('should not update comment 1 with AUTH but incorrect body', async () => {
        if (!comment_1) throw new Error('test cannot be performed.');
        const data1: CreateCommentInputModel = {
            content: "UPDATED COMMENT 1"
        }

        await request(app)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send(data1)
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        await request(app)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send({
                content: generateString(401)
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)

        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.OK_200)
            expect(response.body).toEqual({
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: expect.any(Object)
            })
    })

    it('should not update comment 2 with AUTH of another user (403)', async () => {
        if (!comment_1) throw new Error('test cannot be performed.');
        const data: CreateCommentInputModel = {
            content: "NEW OUTSTANDING UPDATED COMMENT 1"
        }

        await request(app)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader2)
            .send(data)
            .expect(HTTP_STATUSES.FORBIDDEN_403)

        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual({
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: expect.any(Object)
            })
    })

    it('should update comment 1 with correct AUTH', async () => {
        if (!comment_1) throw new Error('test cannot be performed.');
        const data: CreateCommentInputModel = {
            content: "NEW OUTSTANDING UPDATED COMMENT 1"
        }

        await request(app)
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual({
                id: comment_1.id,
                content: data.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: expect.any(Object)
            })
        comment_1.content = data.content
    })

    it('DELETE/PUT should return 404 if :id from uri param not found', async () => {
        if (!comment_1) throw new Error('test cannot be performed.');
        const data: CreateCommentInputModel = {
            content: "NEW OUTSTANDING UPDATED COMMENT 222"
        }

        await request(app)
            .put(`${RouterPaths.comments}/111111111111`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        await request(app)
            .delete(`${RouterPaths.comments}/111111111111`)
            .set(authJWTHeader1)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual({
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: expect.any(Object)
            })
    })

    it('should not delete comment_1 with AUTH of another user (403)', async () => {
        if (!comment_1) throw new Error('test cannot be performed.');
        await request(app)
            .delete(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader2)
            .expect(HTTP_STATUSES.FORBIDDEN_403)

        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual({
                id: comment_1.id,
                content: comment_1.content,
                commentatorInfo: comment_1.commentatorInfo,
                createdAt: comment_1.createdAt,
                likesInfo: expect.any(Object)
            })
    })

    it('should delete comment 1 with correct AUTH and path', async () => {
        if (!comment_1 || !comment_2 || !post) throw new Error('test cannot be performed.');

        await request(app)
            .delete(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HTTP_STATUSES.NOT_FOUND_404)

        const response = await request(app)
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual({
                pagesCount: 1, page: 1, pageSize: 10, totalCount: 1, items: [{
                    id: comment_2.id,
                    content: comment_2.content,
                    commentatorInfo: comment_2.commentatorInfo,
                    createdAt: comment_2.createdAt,
                    likesInfo: expect.any(Object)
                }]
            })
    })
})
