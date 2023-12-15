import request from "supertest";
import {HttpStatusType, HTTP_STATUSES} from "../../src/enums/http-statuses";
import {app} from "../../src/app_settings";
import {RouterPaths} from "../../src/helpers/router-paths";
import {CreateCommentInputModel} from "../../src/models/comment/create-input-comment-model";
import * as supertest from "supertest";
import {CommentViewModel} from "../../src/models/comment/comment-view-model";

export const commentsTestManager = {
    /*
    * метод создания комментария с ожидаемым в ответ кодом статуса (например, можно ожидать 201 или 400).
    * Если ожидаем успешное создание, метод выполнит проверку тела ответа.
    * */
    async createComment(postId: string, data: CreateCommentInputModel, expectedStatusCode: HttpStatusType = HTTP_STATUSES.CREATED_201, headers = {})
        : Promise<{ response: supertest.Response; createdComment: CommentViewModel | null }> {
        const response: request.Response = await request(app)
            .post(`${RouterPaths.posts}/${postId}/comments`)
            .set(headers)
            .send(data)
            .expect(expectedStatusCode)

        let createdComment: CommentViewModel | null = null;

        if (expectedStatusCode === HTTP_STATUSES.CREATED_201) {

            createdComment = response.body;

            expect(createdComment).toEqual({
                id: expect.any(String),
                content: data.content,
                commentatorInfo: {
                    userId: expect.any(String),
                    userLogin: expect.any(String)
                },
                createdAt: expect.any(String),
                likesInfo: {
                    dislikesCount: 0,
                    likesCount: 0,
                    myStatus: "None",
                },
            })

        }

        return {response, createdComment}
    }
}
