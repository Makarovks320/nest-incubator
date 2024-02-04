import request from 'supertest';
import { authBasicHeader } from './test_utilities';
import * as supertest from 'supertest';
import {
    CreatePostByBlogsRouterInputModel,
    CreatePostInputModel,
} from '../../src/features/posts/types/create-post-input-type';
import { HttpStatusType } from '../../src/application/types/types';
import { PostViewModel } from '../../src/features/posts/types/post-view-model';
import { RouterPaths } from '../../src/application/types/router-paths';
import { HttpStatus } from '../../src/application/types/types';
import { AppE2eTestingProvider, getTestingEnvironment } from './get-testing-environment';

const testingProvider: AppE2eTestingProvider = getTestingEnvironment();
export const postsTestManager = {
    /*
     * метод создания поста с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
     * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
     * */
    async createPost(
        data: CreatePostInputModel,
        expectedStatusCode: HttpStatusType,
        useBlogsRouter: boolean = false,
    ): Promise<{ response: supertest.Response; createdPost: PostViewModel | null }> {
        const path = useBlogsRouter ? `${RouterPaths.blogs}/${data.blogId}/posts` : RouterPaths.posts;
        let sendData: CreatePostInputModel | CreatePostByBlogsRouterInputModel = data;
        if (useBlogsRouter) {
            sendData = {
                title: data.title,
                content: data.content,
                shortDescription: data.shortDescription,
            };
        }
        const response: request.Response = await testingProvider
            .getHttp()
            .post(path)
            .set(authBasicHeader)
            .send(sendData)
            .expect(expectedStatusCode);
        let createdPost: PostViewModel | null = null;

        if (expectedStatusCode === HttpStatus.CREATED_201) {
            createdPost = response.body;

            if (!createdPost) {
                throw new Error('test cannot be performed.');
            }

            expect(createdPost).toEqual({
                createdAt: expect.any(String),
                id: expect.any(String),
                title: data.title,
                content: data.content,
                shortDescription: data.shortDescription,
                blogId: createdPost.blogId,
                blogName: expect.any(String),
                extendedLikesInfo: {
                    likesCount: 0,
                    dislikesCount: 0,
                    myStatus: 'None',
                    newestLikes: [],
                },
            });
        }

        return { response, createdPost: createdPost };
    },

    async updatePost(
        post_id: string,
        data: CreatePostInputModel,
        expectedStatusCode: HttpStatusType,
    ): Promise<{ response: supertest.Response; updatedPost: PostViewModel | null }> {
        const response: request.Response = await testingProvider
            .getHttp()
            .put(RouterPaths.posts + '/' + post_id)
            .set(authBasicHeader)
            .send(data)
            .expect(expectedStatusCode);
        let updatedPost: PostViewModel | null = null;

        if (expectedStatusCode === HttpStatus.CREATED_201) {
            updatedPost = response.body;

            if (!updatedPost) throw new Error('test cannot be performed.');

            expect(updatedPost).toEqual({
                createdAt: expect.any(String),
                _id: expect.any(String),
                title: data.title,
                content: data.content,
                shortDescription: data.shortDescription,
                blogId: updatedPost.blogId,
                blogName: expect.any(String),
            });
        }

        return { response, updatedPost: updatedPost };
    },
};
