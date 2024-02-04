import request from 'supertest';
import * as supertest from 'supertest';
import { HttpStatus } from '../../src/application/types/types';
import { CreateCommentInputModel } from '../../src/features/comments/01-api/models/input-models/CreateCommentInputModel';
import { HttpStatusType } from '../../src/application/types/types';
import { CommentViewModel } from '../../src/features/comments/01-api/models/output-models/CommentViewModel';
import { RouterPaths } from '../../src/application/types/router-paths';
import { AppE2eTestingProvider, getTestingEnvironment } from './get-testing-environment';

const testingProvider: AppE2eTestingProvider = getTestingEnvironment();
export const commentsTestManager = {
    /*
     * метод создания комментария с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
     * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
     * */
    async createComment(
        postId: string,
        data: CreateCommentInputModel,
        expectedStatusCode: HttpStatusType = HttpStatus.CREATED_201,
        headers = {},
    ): Promise<{ response: supertest.Response; createdComment: CommentViewModel | null }> {
        const response: request.Response = await testingProvider
            .getHttp()
            .post(`${RouterPaths.posts}/${postId}/comments`)
            .set(headers)
            .send(data)
            .expect(expectedStatusCode);

        let createdComment: CommentViewModel | null = null;

        if (expectedStatusCode === HttpStatus.CREATED_201) {
            createdComment = response.body;

            expect(createdComment).toEqual({
                id: expect.any(String),
                content: data.content,
                commentatorInfo: {
                    userId: expect.any(String),
                    userLogin: expect.any(String),
                },
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: 'None',
                },
            });
        }

        return { response, createdComment };
    },
};
