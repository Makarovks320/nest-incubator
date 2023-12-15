import {HTTP_STATUSES} from "../../../src/enums/http-statuses";
import {
    authBasicHeader,
    clearDatabase,
    connectToDataBases,
    disconnectFromDataBases
} from "../../utils/test_utilities";
import {CreateUserInputModel} from "../../../src/models/user/create-input-user-model";
import {UserViewModel} from "../../../src/models/user/user-view-model";
import {usersTestManager} from "../../utils/usersTestManager";
import {BlogViewModel} from "../../../src/models/blog/blog-view-model";
import {PostViewModel} from "../../../src/models/post/post-view-model";
import {CreatePostInputModel} from "../../../src/models/post/create-post-input-model";
import {CreateBlogInputModel} from "../../../src/models/blog/create-input-blog-model";
import {blogsTestManager} from "../../utils/blogsTestManager";
import {postsTestManager} from "../../utils/postsTestManager";
import {authTestManager} from "../../utils/authTestManager";
import {LIKE_STATUS_ENUM} from "../../../src/models/like/like-db-model";
import {likeTestManager} from "../../utils/likeTestManager";

describe('testing likes for posts', () => {
    const email1: string = "email-1@mail.com";
    const email2: string = "email-2@mail.com";
    const email3: string = "email-3@mail.com";
    const email4: string = "email-4@mail.com";
    const password: string = "password123";

    let blog: BlogViewModel | null;
    let post: PostViewModel | null;
    let user_1: UserViewModel | null = null;
    let user_2: UserViewModel | null = null;
    let user_3: UserViewModel | null = null;
    let user_4: UserViewModel | null = null;
    let authJWTHeader1 = {}
    let authJWTHeader2 = {}
    let authJWTHeader3 = {}
    let authJWTHeader4 = {}

    beforeAll(connectToDataBases);

    beforeAll(clearDatabase);

    afterAll(disconnectFromDataBases);


    beforeAll(async () => {
        // Создаем блог, к которому будем прикреплять пост
        const blogData: CreateBlogInputModel = {
            "name": "Walter White",
            "description": "Werner Heisenberg: Quantum pioneer, uncertainty principle.",
            "websiteUrl": "https://qwerty.com",
        }

        const {createdBlog} = await blogsTestManager.createBlog(blogData, HTTP_STATUSES.CREATED_201);
        if (!createdBlog) throw new Error('test cannot be performed.');
        blog = createdBlog;

        // Создаем пост, к которому будем ставить лайки и дизлайки
        const postData: CreatePostInputModel = {
            "title": "amazing Math_1",
            "shortDescription": "Short description about new amazing Math_1 course",
            "content": "Math_1 Math_1 Math_1 Math_1 Math_1 Math_1",
            "blogId": createdBlog.id,
        }

        const {createdPost} = await postsTestManager.createPost(postData, HTTP_STATUSES.CREATED_201);
        post = createdPost;

        // Создаем четырех юзеров
        const userData1: CreateUserInputModel = {
            "login": "User01",
            "password": password,
            "email": email1,
        }
        const userData2: CreateUserInputModel = {
            "login": "User02",
            "password": password,
            "email": email2,
        }
        const userData3: CreateUserInputModel = {
            "login": "User03",
            "password": password,
            "email": email3,
        }
        const userData4: CreateUserInputModel = {
            "login": "User04",
            "password": password,
            "email": email4,
        }

        const {createdUser} = await usersTestManager.createUser(userData1, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user_1 = createdUser;
        const {createdUser: createdUser2} = await usersTestManager.createUser(userData2, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user_2 = createdUser2;
        const {createdUser: createdUser3} = await usersTestManager.createUser(userData3, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user_3 = createdUser3
        const {createdUser: createdUser4} = await usersTestManager.createUser(userData4, HTTP_STATUSES.CREATED_201, authBasicHeader)
        user_4 = createdUser4
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post).not.toBeNull();
        expect(user_1).not.toBeNull();
        expect(user_2).not.toBeNull();
        expect(user_3).not.toBeNull();
        expect(user_4).not.toBeNull();
    });

    it('should sign in each users with correct credentials; status 200; ' +
        'content: JWT access token, JWT refresh token in cookie (http only, secure);', async () => {
        const result1: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: email1, password: password});
        authJWTHeader1 = {Authorization: `Bearer ${result1!.accessToken}`}
        const result2: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: email2, password: password});
        authJWTHeader2 = {Authorization: `Bearer ${result2!.accessToken}`}
        const result3: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: email3, password: password});
        authJWTHeader3 = {Authorization: `Bearer ${result3!.accessToken}`}
        const result4: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: email4, password: password});
        authJWTHeader4 = {Authorization: `Bearer ${result4!.accessToken}`}
    });


    it('should add like for post', async () => {
        if (!post) throw new Error('test cannot be performed.');
        if (!user_1) throw new Error('test cannot be performed.');

        // добавим один лайк от юзера_1
        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
        // без заголовка авторизации не должен возвращать статус текущего юзера
        await likeTestManager.checkLikeStatusForPostById(post.id, 1, 0, [user_1]);
        // с заголовком авторизации должен вернуть статус текущего юзера
        await likeTestManager.checkLikeStatusForPostById(post.id, 1, 0, [user_1], LIKE_STATUS_ENUM.LIKE, authJWTHeader1);

    });

    it('should change like to dislike for post', async () => {
        if (!post) throw new Error('test cannot be performed.');
        if (!user_1) throw new Error('test cannot be performed.');

        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader1, LIKE_STATUS_ENUM.DISLIKE);

        await likeTestManager.checkLikeStatusForPostById(post.id, 0, 1, [], LIKE_STATUS_ENUM.DISLIKE, authJWTHeader1);

    });

    it('should remove dislike for post', async () => {
        if (!post) throw new Error('test cannot be performed.');
        if (!user_1) throw new Error('test cannot be performed.');

        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader1, LIKE_STATUS_ENUM.NONE);

        await likeTestManager.checkLikeStatusForPostById(post.id, 0, 0, [], LIKE_STATUS_ENUM.NONE, authJWTHeader1);

    });


    it('like the post by user 1, user 2, user 3, user 4. get the post after each like by user 1.' +
        '   NewestLikes should be sorted in descending; status 204;', async () => {
        if (!post || !user_1 || !user_2 || !user_3 || !user_4) throw new Error('test cannot be performed.');
        // like the post by user_1
        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);

        await likeTestManager.checkLikeStatusForPostById(post.id, 1, 0, [user_1], LIKE_STATUS_ENUM.LIKE, authJWTHeader1);
        // like the post by user_2
        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.checkLikeStatusForPostById(post.id, 2, 0, [user_2, user_1], LIKE_STATUS_ENUM.LIKE, authJWTHeader1);
        // like the post by user_3
        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader3, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.checkLikeStatusForPostById(post.id, 3, 0, [user_3, user_2, user_1], LIKE_STATUS_ENUM.LIKE, authJWTHeader1);
        // like the post by user_4
        await likeTestManager.changeLikeStatusForPost(post.id, authJWTHeader4, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.checkLikeStatusForPostById(post.id, 4, 0, [user_4, user_3, user_2], LIKE_STATUS_ENUM.LIKE, authJWTHeader1);
    })

//
//     it('should add dislike for comment', async () => {
//         if (!comment1) throw new Error('test cannot be performed.');
//
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.DISLIKE)
//
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 1, LIKE_STATUS_ENUM.DISLIKE, authJWTHeader1);
//
//     });
//
//
//     it('should remove dislike for comment', async () => {
//         if (!comment1) throw new Error('test cannot be performed.');
//
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.NONE);
//
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE, authJWTHeader1);
//
//     });
//
//
//     it('should add likes and dislikes from several users for the comment', async () => {
//         if (!comment1) throw new Error('test cannot be performed.');
//
//         // залогинимся под user_2
//         const user_2_authorizationResult: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: user_2!.email, password: password});
//         authJWTHeader2 = {Authorization: `Bearer ${user_2_authorizationResult!.accessToken}`}
//
//         // залогинимся под user_3
//         const user_3_authorizationResult: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: user_3!.email, password: password});
//         authJWTHeader3 = {Authorization: `Bearer ${user_3_authorizationResult!.accessToken}`}
//
//         //проверим, что на данный момент у коммента нет лайков
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE);
//
//         // ставим 2 лайка  и один дизлайк от трех разных юзеров
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader3, LIKE_STATUS_ENUM.DISLIKE);
//
//         // проверяем likesInfo коммента, включая статус текущего юзера
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 2, 1, LIKE_STATUS_ENUM.DISLIKE, authJWTHeader3);
//         // проверяем likesInfo коммента анонимно
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 2, 1, LIKE_STATUS_ENUM.NONE);
//
//         // поменяем на 3 лайка
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader3, LIKE_STATUS_ENUM.LIKE);
//
//         // снова проверим likesInfo коммента, от авторизованного user_3
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 3, 0, LIKE_STATUS_ENUM.LIKE, authJWTHeader3);
//     });
//
//
//     it('should add likes for several comments from different users', async () => {
//         if (!post) throw new Error('test cannot be performed.');
//
//         //создадим еще два коммента
//         const data2: CreateCommentInputModel = {content: generateString(20)}
//         const data3: CreateCommentInputModel = {content: generateString(20)}
//
//         const {createdComment: createdComment2} = await commentsTestManager.createComment(post.id, data2, HTTP_STATUSES.CREATED_201, authJWTHeader1)
//         comment2 = createdComment2;
//         const {createdComment: createdComment3} = await commentsTestManager.createComment(post.id, data3, HTTP_STATUSES.CREATED_201, authJWTHeader1)
//         comment3 = createdComment3;
//
//
//         // залогинимся под user_2
//         const user_2_authorizationResult: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: user_2!.email, password});
//         authJWTHeader2 = {Authorization: `Bearer ${user_2_authorizationResult!.accessToken}`}
//
//         // залогинимся под user_3
//         const user_3_authorizationResult: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({loginOrEmail: user_3!.email, password});
//         authJWTHeader3 = {Authorization: `Bearer ${user_3_authorizationResult!.accessToken}`}
//
//         // Проверка исключительно для тайпскрипта
//         if (!comment1) throw new Error('test cannot be performed.');
//         if (!comment2) throw new Error('test cannot be performed.');
//         if (!comment3) throw new Error('test cannot be performed.');
//
//         //проверим, что на данный момент у comment1 нет лайков
//         //await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE);
//
//         // ставим 2 лайка  и один дизлайк от трех разных юзеров для comment1
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader3, LIKE_STATUS_ENUM.DISLIKE);
//         // ставим 3 лайка  от трех разных юзеров для comment2
//         await likeTestManager.changeLikeStatusForComment(comment2.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment2.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment2.id, authJWTHeader3, LIKE_STATUS_ENUM.LIKE);
//         // ставим 1 лайк, 1 дизлайк от двух разных юзеров для comment3. От user_3 не ставим.
//         await likeTestManager.changeLikeStatusForComment(comment3.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
//         await likeTestManager.changeLikeStatusForComment(comment3.id, authJWTHeader2, LIKE_STATUS_ENUM.DISLIKE);
//
//         // проверяем likesInfo comment1, включая статус текущего юзера
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 2, 1, LIKE_STATUS_ENUM.DISLIKE, authJWTHeader3);
//
//         // проверяем likesInfo коммента анонимно
//         await likeTestManager.checkLikeStatusForCommentById(comment1.id, 2, 1, LIKE_STATUS_ENUM.NONE);
//
//         //проверяем по всем комментам
//         const listOfComments: CommentWithLikeInfo[] = [
//             {
//                 comment_id: comment3.id,
//                 likesCount: 1,
//                 dislikesCount: 1,
//                 myStatus: LIKE_STATUS_ENUM.NONE
//             },
//             {
//                 comment_id: comment2.id,
//                 likesCount: 3,
//                 dislikesCount: 0,
//                 myStatus: LIKE_STATUS_ENUM.LIKE
//             },
//             {
//                 comment_id: comment1.id,
//                 likesCount: 2,
//                 dislikesCount: 1,
//                 myStatus: LIKE_STATUS_ENUM.DISLIKE
//             },
//
//         ]
//         await likeTestManager.checkLikesForCommentListByPostId(post.id, listOfComments, authJWTHeader3);
// });
})
