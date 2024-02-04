import { HttpStatus } from '../../../src/application/types/types';
import { authBasicHeader, generateString } from '../../utils/test_utilities';
import { usersTestManager } from '../../utils/usersTestManager';
import { blogsTestManager } from '../../utils/blogsTestManager';
import { postsTestManager } from '../../utils/postsTestManager';
import { commentsTestManager } from '../../utils/commentsTestManager';
import { authTestManager } from '../../utils/authTestManager';
import { getTestingEnvironment } from '../../utils/get-testing-environment';
import { BlogViewModel, CreateBlogInputModel } from '../../../src/features/blogs/types/dto';
import { PostViewModel } from '../../../src/features/posts/types/post-view-model';
import { UserViewModel } from '../../../src/features/users/types/user-view-model';
import { CommentViewModel } from '../../../src/features/comments/01-api/models/output-models/CommentViewModel';
import { CreatePostInputModel } from '../../../src/features/posts/types/create-post-input-type';
import { CreateUserInputModel } from '../../../src/features/users/05-dto/CreateUserInputModel';
import { CreateCommentInputModel } from '../../../src/features/comments/01-api/models/input-models/CreateCommentInputModel';
import { LIKE_STATUS_ENUM } from '../../../src/features/likes/03-domain/types';
import { CommentWithLikeInfo, likeTestManager } from '../../utils/likeTestManager';

describe('/testing likes for comments', () => {
    getTestingEnvironment();

    const email1: string = 'email-1@mail.com';
    const email2: string = 'email-2@mail.com';
    const email3: string = 'email-3@mail.com';
    const password: string = 'password123';

    let blog: BlogViewModel | null;
    let post: PostViewModel | null;
    let user_1: UserViewModel | null = null;
    let user_2: UserViewModel | null = null;
    let user_3: UserViewModel | null = null;
    let authJWTHeader1 = {};
    let authJWTHeader2 = {};
    let authJWTHeader3 = {};
    let comment1: CommentViewModel | null = null;
    let comment2: CommentViewModel | null = null;
    let comment3: CommentViewModel | null = null;

    beforeAll(async () => {
        // Создаем блог, к которому будем прикреплять пост
        const blogData: CreateBlogInputModel = {
            name: 'Walter White',
            description: 'Werner Heisenberg: Quantum pioneer, uncertainty principle.',
            websiteUrl: 'https://qwerty.com',
        };

        const { createdBlog } = await blogsTestManager.createBlog(blogData, HttpStatus.CREATED_201);
        if (!createdBlog) throw new Error('test cannot be performed.');
        blog = createdBlog;

        // Создаем пост, к которому будем прикреплять комменты
        const postData: CreatePostInputModel = {
            title: 'amazing Math_1',
            shortDescription: 'Short description about new amazing Math_1 course',
            content: 'Math_1 Math_1 Math_1 Math_1 Math_1 Math_1',
            blogId: createdBlog.id,
        };

        const { createdPost } = await postsTestManager.createPost(postData, HttpStatus.CREATED_201);
        post = createdPost;

        // Создаем юзера 1, чтобы оставлять комменты и лайкать их
        const userData: CreateUserInputModel = {
            login: 'User01',
            password: password,
            email: email1,
        };
        // Создаем юзеров 2 и 3, чтобы лайкали
        const userData2: CreateUserInputModel = {
            login: 'User02',
            password: password,
            email: email2,
        };
        const userData3: CreateUserInputModel = {
            login: 'User02',
            password: password,
            email: email3,
        };

        const { createdUser } = await usersTestManager.createUser(userData, HttpStatus.CREATED_201, authBasicHeader);
        user_1 = createdUser;
        const { createdUser: createdUser2 } = await usersTestManager.createUser(
            userData2,
            HttpStatus.CREATED_201,
            authBasicHeader,
        );
        user_2 = createdUser2;
        const { createdUser: createdUser3 } = await usersTestManager.createUser(
            userData3,
            HttpStatus.CREATED_201,
            authBasicHeader,
        );
        user_3 = createdUser3;
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post).not.toBeNull();
        expect(user_1).not.toBeNull();
        expect(user_2).not.toBeNull();
        expect(user_3).not.toBeNull();
    });

    it(
        'should sign in user_1 with correct credentials; status 200; ' +
            'content: JWT access token, JWT refresh token in cookie (http only, secure);',
        async () => {
            const result: { accessToken: string; refreshToken: string } | null = await authTestManager.loginUser({
                loginOrEmail: email1,
                password: password,
            });
            authJWTHeader1 = { Authorization: `Bearer ${result!.accessToken}` };
        },
    );

    it('should create new comment; status 201; content: created comment;', async () => {
        if (!post) throw new Error('test cannot be performed.');

        const data: CreateCommentInputModel = { content: "Say my name! Heisenberg? You're goddamn right!" };

        const { createdComment } = await commentsTestManager.createComment(
            post.id,
            data,
            HttpStatus.CREATED_201,
            authJWTHeader1,
        );

        comment1 = createdComment;

        if (!comment1) throw new Error('test cannot be performed.');

        await likeTestManager.checkLikesForCommentListByPostId(post.id);

        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE);
    });

    it('should add like for comment', async () => {
        if (!comment1) throw new Error('test cannot be performed.');

        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
        // без заголовка авторизации не должен возвращать статус текущего юзера
        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 1, 0, LIKE_STATUS_ENUM.NONE);
        // с заголовком авторизации должен вернуть статус текущего юзера
        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 1, 0, LIKE_STATUS_ENUM.LIKE, authJWTHeader1);
    });

    it('should remove like for comment', async () => {
        if (!comment1) throw new Error('test cannot be performed.');

        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.NONE);

        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE, authJWTHeader1);
    });

    it('should add dislike for comment', async () => {
        if (!comment1) throw new Error('test cannot be performed.');

        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.DISLIKE);

        await likeTestManager.checkLikeStatusForCommentById(
            comment1.id,
            0,
            1,
            LIKE_STATUS_ENUM.DISLIKE,
            authJWTHeader1,
        );
    });

    it('should remove dislike for comment', async () => {
        if (!comment1) throw new Error('test cannot be performed.');

        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.NONE);

        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE, authJWTHeader1);
    });

    it('should add likes and dislikes from several users for the comment', async () => {
        if (!comment1) throw new Error('test cannot be performed.');

        // залогинимся под user_2
        const user_2_authorizationResult: { accessToken: string; refreshToken: string } | null =
            await authTestManager.loginUser({ loginOrEmail: user_2!.email, password: password });
        authJWTHeader2 = { Authorization: `Bearer ${user_2_authorizationResult!.accessToken}` };

        // залогинимся под user_3
        const user_3_authorizationResult: { accessToken: string; refreshToken: string } | null =
            await authTestManager.loginUser({ loginOrEmail: user_3!.email, password: password });
        authJWTHeader3 = { Authorization: `Bearer ${user_3_authorizationResult!.accessToken}` };

        //проверим, что на данный момент у коммента нет лайков
        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 0, 0, LIKE_STATUS_ENUM.NONE);

        // ставим 2 лайка  и один дизлайк от трех разных юзеров
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader3, LIKE_STATUS_ENUM.DISLIKE);

        // проверяем likesInfo коммента, включая статус текущего юзера
        await likeTestManager.checkLikeStatusForCommentById(
            comment1.id,
            2,
            1,
            LIKE_STATUS_ENUM.DISLIKE,
            authJWTHeader3,
        );
        // проверяем likesInfo коммента анонимно
        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 2, 1, LIKE_STATUS_ENUM.NONE);

        // поменяем на 3 лайка
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader3, LIKE_STATUS_ENUM.LIKE);

        // снова проверим likesInfo коммента, от авторизованного user_3
        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 3, 0, LIKE_STATUS_ENUM.LIKE, authJWTHeader3);
    });

    it('should add likes for several comments from different users', async () => {
        if (!post) throw new Error('test cannot be performed.');

        //создадим еще два коммента
        const data2: CreateCommentInputModel = { content: generateString(20) };
        const data3: CreateCommentInputModel = { content: generateString(20) };

        const { createdComment: createdComment2 } = await commentsTestManager.createComment(
            post.id,
            data2,
            HttpStatus.CREATED_201,
            authJWTHeader1,
        );
        comment2 = createdComment2;
        const { createdComment: createdComment3 } = await commentsTestManager.createComment(
            post.id,
            data3,
            HttpStatus.CREATED_201,
            authJWTHeader1,
        );
        comment3 = createdComment3;

        // залогинимся под user_2
        const user_2_authorizationResult: { accessToken: string; refreshToken: string } | null =
            await authTestManager.loginUser({ loginOrEmail: user_2!.email, password });
        authJWTHeader2 = { Authorization: `Bearer ${user_2_authorizationResult!.accessToken}` };

        // залогинимся под user_3
        const user_3_authorizationResult: { accessToken: string; refreshToken: string } | null =
            await authTestManager.loginUser({ loginOrEmail: user_3!.email, password });
        authJWTHeader3 = { Authorization: `Bearer ${user_3_authorizationResult!.accessToken}` };

        // Проверка исключительно для тайпскрипта
        if (!comment1) throw new Error('test cannot be performed.');
        if (!comment2) throw new Error('test cannot be performed.');
        if (!comment3) throw new Error('test cannot be performed.');

        //на данный момент у comment1 три лайка

        // ставим 2 лайка и один дизлайк от трех разных юзеров для comment1
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment1.id, authJWTHeader3, LIKE_STATUS_ENUM.DISLIKE);
        // ставим 3 лайка  от трех разных юзеров для comment2
        await likeTestManager.changeLikeStatusForComment(comment2.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment2.id, authJWTHeader2, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment2.id, authJWTHeader3, LIKE_STATUS_ENUM.LIKE);
        // ставим 1 лайк, 1 дизлайк от двух разных юзеров для comment3. От user_3 не ставим.
        await likeTestManager.changeLikeStatusForComment(comment3.id, authJWTHeader1, LIKE_STATUS_ENUM.LIKE);
        await likeTestManager.changeLikeStatusForComment(comment3.id, authJWTHeader2, LIKE_STATUS_ENUM.DISLIKE);

        // проверяем likesInfo comment1, включая статус текущего юзера
        await likeTestManager.checkLikeStatusForCommentById(
            comment1.id,
            2,
            1,
            LIKE_STATUS_ENUM.DISLIKE,
            authJWTHeader3,
        );

        // проверяем likesInfo коммента анонимно
        await likeTestManager.checkLikeStatusForCommentById(comment1.id, 2, 1, LIKE_STATUS_ENUM.NONE);

        //проверяем по всем комментам
        const listOfComments: CommentWithLikeInfo[] = [
            {
                comment_id: comment3.id,
                likesCount: 1,
                dislikesCount: 1,
                myStatus: LIKE_STATUS_ENUM.NONE,
            },
            {
                comment_id: comment2.id,
                likesCount: 3,
                dislikesCount: 0,
                myStatus: LIKE_STATUS_ENUM.LIKE,
            },
            {
                comment_id: comment1.id,
                likesCount: 2,
                dislikesCount: 1,
                myStatus: LIKE_STATUS_ENUM.DISLIKE,
            },
        ];
        await likeTestManager.checkLikesForCommentListByPostId(post.id, listOfComments, authJWTHeader3);
    });
});
