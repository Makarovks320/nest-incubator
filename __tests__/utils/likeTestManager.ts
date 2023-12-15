import request from "supertest";
import {HttpStatusType, HTTP_STATUSES} from "../../src/enums/http-statuses";
import {app} from "../../src/app_settings";
import {RouterPaths} from "../../src/helpers/router-paths";
import {LIKE_STATUS_ENUM, LikeStatusType} from "../../src/models/like/like-db-model";
import {NewestLikesType, PostViewModel} from "../../src/models/post/post-view-model";
import {UserViewModel} from "../../src/models/user/user-view-model";

export type CommentWithLikeInfo = {
    comment_id: string,
    likesCount: number,
    dislikesCount: number,
    myStatus: LikeStatusType
}
export const likeTestManager = {
    /*
    добавление/удаление лайка/дизлайка
     */
    async changeLikeStatusForComment(
        comment_id: string,
        authJWTHeader: Object,
        likeStatus: LikeStatusType,
        expectedStatusCode: HttpStatusType = HTTP_STATUSES.NO_CONTENT_204,
    ): Promise<void> {
        await request(app)
            .put(`${RouterPaths.comments}/${comment_id}/like-status`)
            .set(authJWTHeader)
            .send({likeStatus: likeStatus})
            .expect(expectedStatusCode);
    },
    /*
    Проверяет единичный коммент на соответствие по количеству лайков, дизлайков и статуса лайка текущего юзера.
    Опционально принимает заголовок авторизации, что позволяет получать статус Лайка от текущего юзера.
     */
    async checkLikeStatusForCommentById(comment_id: string,
                                        likesCount: number,
                                        dislikesCount: number,
                                        myStatus: LikeStatusType = LIKE_STATUS_ENUM.NONE,
                                        authJWTHeader = {}): Promise<void> {
        const response = await request(app)
            .get(`${RouterPaths.comments}/${comment_id}`)
            .set(authJWTHeader)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual(
            {
                id: comment_id,
                content: expect.any(String),
                commentatorInfo: expect.any(Object),
                createdAt: expect.any(String),
                likesInfo: {
                    likesCount: likesCount,
                    dislikesCount: dislikesCount,
                    myStatus: myStatus
                }
            }
        )
    },
    /*
    Проверяет коммент на соответствие по количеству лайков, дизлайков и статуса лайка текущего юзера
    в представлении View модели поста с массивом комментов с пагинацией.
    Предназначен для случая, если у поста есть только один коммент.
    Параметры пагинации прописаны хардкодом.
     */
    async checkLikesForCommentListByPostId(post_id: string,
                                           listOfComments: CommentWithLikeInfo[] = [{
                                               comment_id: '',
                                               likesCount: 0,
                                               dislikesCount: 0,
                                               myStatus: LIKE_STATUS_ENUM.NONE
                                           }],
                                           authJWTHeader = {}) {
        const response = await request(app)
            .get(`${RouterPaths.posts}/${post_id}/comments`)
            .set(authJWTHeader)
            .expect(HTTP_STATUSES.OK_200);
        expect(response.body).toEqual({
            pagesCount: 1, page: 1, pageSize: 10, totalCount: listOfComments.length,
            items: listOfComments.map(c => {
                return {
                    id: c.comment_id ? c.comment_id : expect.any(String),
                    content: expect.any(String),
                    commentatorInfo: expect.any(Object),
                    createdAt: expect.any(String),
                    likesInfo: {
                        likesCount: c.likesCount,
                        dislikesCount: c.dislikesCount,
                        myStatus: c.myStatus
                    }
                }
            })
        })
    },

    async changeLikeStatusForPost(
        post_id: string,
        authJWTHeader: Object,
        likeStatus: LikeStatusType,
        expectedStatusCode: HttpStatusType = HTTP_STATUSES.NO_CONTENT_204,
    ): Promise<void> {
        await request(app)
            .put(`${RouterPaths.posts}/${post_id}/like-status`)
            .set(authJWTHeader)
            .send({likeStatus: likeStatus})
            .expect(expectedStatusCode);
    },

    async checkLikeStatusForPostById(post_id: string,
                                     likesCount: number,
                                     dislikesCount: number,
                                     lastLikedUsers: UserViewModel[] | [] = [],
                                     myStatus: LikeStatusType = LIKE_STATUS_ENUM.NONE,
                                     authJWTHeader = {}): Promise<void> {
        const response = await request(app)
            .get(`${RouterPaths.posts}/${post_id}`)
            .set(authJWTHeader)
            .expect(HTTP_STATUSES.OK_200);
        const result: PostViewModel = response.body;
        expect(result).toEqual(
            {
                id: post_id,
                title: expect.any(String),
                shortDescription: expect.any(String),
                content: expect.any(String),
                blogId: expect.any(String),
                blogName: expect.any(String),
                createdAt: expect.any(String),
                extendedLikesInfo: {
                    likesCount,
                    dislikesCount,
                    myStatus,
                    newestLikes: lastLikedUsers.map(u => {
                        const newestLikeInfo: NewestLikesType = {
                            addedAt: expect.any(String),
                            userId: u.id,
                            login: u.login
                        }
                        return newestLikeInfo;
                    })
                }
            }
        )
    }
}
