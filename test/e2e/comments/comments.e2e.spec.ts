import { HttpStatus } from '../../../src/application/types/types';
import { RouterPaths } from '../../../src/application/types/router-paths';
import { AppE2eTestingProvider, getTestingEnvironment } from '../../utils/get-testing-environment';
import { BlogViewModel, CreateBlogInputModel } from '../../../src/features/blogs/types/dto';
import { blogsTestManager } from '../../utils/blogsTestManager';
import { authBasicHeader, generateString } from '../../utils/test_utilities';
import { PostViewModel } from '../../../src/features/posts/types/post-view-model';
import { UserViewModel } from '../../../src/features/users/types/user-view-model';
import { postsTestManager } from '../../utils/postsTestManager';
import { usersTestManager } from '../../utils/usersTestManager';
import { CreatePostInputModel } from '../../../src/features/posts/types/create-post-input-type';
import { CreateUserInputModel } from '../../../src/features/users/05-dto/CreateUserInputModel';
import { CommentViewModel } from '../../../src/features/comments/01-api/models/output-models/CommentViewModel';
import { CreateCommentInputModel } from '../../../src/features/comments/01-api/models/input-models/CreateCommentInputModel';
import { commentsTestManager } from '../../utils/commentsTestManager';
import { ObjectId } from 'mongodb';

describe('/comments tests', () => {
    const testingProvider: AppE2eTestingProvider = getTestingEnvironment();

    let post: PostViewModel | null;
    let user1: UserViewModel | null;
    let user2: UserViewModel | null;
    let blog: BlogViewModel | null;
    let authJWTHeader1: object;
    let authJWTHeader2: object;

    beforeAll(async () => {
        // Создаем блог, к которому будем прикреплять пост
        const dataBlog: CreateBlogInputModel = {
            name: generateString(15),
            description: generateString(35),
            websiteUrl: 'http://test.ru',
        };

        const { createdBlog } = await blogsTestManager.createBlog(dataBlog, HttpStatus.CREATED_201);
        if (!createdBlog) throw new Error('test cannot be performed');

        blog = createdBlog;

        // Создаем пост, к которому будем прикреплять комменты
        const dataPost: CreatePostInputModel = {
            title: 'amazing Math_1',
            shortDescription: generateString(45),
            content: generateString(45),
            blogId: createdBlog.id,
        };

        const { createdPost } = await postsTestManager.createPost(dataPost, HttpStatus.CREATED_201);
        post = createdPost;

        //Создаем юзера1, чтобы оставлять комменты

        const dataUser: CreateUserInputModel = {
            login: 'User01',
            password: 'Password01',
            email: 'email01@fishmail2dd.com',
        };

        const { createdUser: createdUser1 } = await usersTestManager.createUser(
            dataUser,
            HttpStatus.CREATED_201,
            authBasicHeader,
        );
        user1 = createdUser1;
        if (!user1) throw new Error('test cannot be performed');

        const AccessToken1 = await testingProvider.getRepositoriesAndUtils().jwtService.createAccessToken(user1.id);
        authJWTHeader1 = { Authorization: `Bearer ${AccessToken1}` };

        //Создаем юзера2, чтобы оставлять комменты

        const dataUser2: CreateUserInputModel = {
            login: 'User02',
            password: 'Password02',
            email: 'email02@fishmail3dd.com',
        };

        const { createdUser: createdUser2 } = await usersTestManager.createUser(
            dataUser2,
            HttpStatus.CREATED_201,
            authBasicHeader,
        );
        user2 = createdUser2;
        if (!user2) throw new Error('test cannot be performed');

        const AccessToken2 = await testingProvider.getRepositoriesAndUtils().jwtService.createAccessToken(user2.id);
        authJWTHeader2 = { Authorization: `Bearer ${AccessToken2}` };
    });

    it('Check that necessary support objects have been successfully created', async () => {
        expect(blog).not.toBeNull();
        expect(post).not.toBeNull();
        expect(user1).not.toBeNull();
        expect(user2).not.toBeNull();
    });

    it('should return 404 for not existing comment', async () => {
        const randomId = new ObjectId().toString();
        await testingProvider.getHttp().get(`${RouterPaths.comments}/${randomId}`).expect(HttpStatus.NOT_FOUND_404);
    });

    it('should return empty array', async () => {
        if (!post) throw new Error('test cannot be performed');

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it('should not create comment without AUTH', async () => {
        if (!post) throw new Error('test cannot be performed');

        const data: CreateCommentInputModel = {
            content: 'Absolutely new comment',
        };

        await commentsTestManager.createComment(post.id, data, HttpStatus.UNAUTHORIZED_401);

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it('should not create comment without content', async () => {
        if (!post) throw new Error('test cannot be performed');

        const data: CreateCommentInputModel = {
            content: '',
        };

        await commentsTestManager.createComment(post.id, data, HttpStatus.BAD_REQUEST_400, authJWTHeader1);

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    // Создаем первый коммент от первого юзера
    let comment_1: CommentViewModel | null = null;
    it('should create comment 1', async () => {
        if (!post) throw new Error('test cannot be performed');

        const data: CreateCommentInputModel = {
            content: generateString(45),
        };

        const { createdComment } = await commentsTestManager.createComment(
            post.id,
            data,
            HttpStatus.CREATED_201,
            authJWTHeader1,
        );

        comment_1 = createdComment;

        if (!comment_1) throw new Error('test cannot be performed');

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200);
        const body = response.body;
        expect(body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [
                {
                    id: comment_1.id,
                    content: data.content,
                    commentatorInfo: comment_1.commentatorInfo,
                    createdAt: comment_1.createdAt,
                    likesInfo: expect.any(Object),
                },
            ],
        });
    });

    // Создаем второй коммент от первого юзера
    let comment_2: CommentViewModel | null = null;
    it('should create comment 2', async () => {
        if (!post) throw new Error('test cannot be performed');

        const data: CreateCommentInputModel = {
            content: generateString(35),
        };

        const { createdComment } = await commentsTestManager.createComment(
            post.id,
            data,
            HttpStatus.CREATED_201,
            authJWTHeader2,
        );

        comment_2 = createdComment;

        if (!comment_1 || !comment_2) throw new Error('test cannot be performed');

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200);

        expect(response.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: [
                {
                    id: comment_2.id,
                    content: data.content,
                    commentatorInfo: comment_2.commentatorInfo,
                    createdAt: comment_2.createdAt,
                    likesInfo: expect.any(Object),
                },
                {
                    id: comment_1.id,
                    content: comment_1.content,
                    commentatorInfo: comment_1.commentatorInfo,
                    createdAt: comment_1.createdAt,
                    likesInfo: expect.any(Object),
                },
            ],
        });
    });

    it('should not update comment 1 without AUTH', async () => {
        if (!comment_1) throw new Error('test cannot be performed');
        const data: CreateCommentInputModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 1',
        };

        await testingProvider
            .getHttp()
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .send(data)
            .expect(HttpStatus.UNAUTHORIZED_401);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK_200);

        expect(response.body).toEqual({
            id: comment_1.id,
            content: comment_1.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object),
        });
    });

    it('should not update comment 1 with AUTH but too short/long content', async () => {
        if (!comment_1) throw new Error('test cannot be performed');
        const data1: CreateCommentInputModel = {
            content: generateString(19),
        };

        await testingProvider
            .getHttp()
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send(data1)
            .expect(HttpStatus.BAD_REQUEST_400);

        await testingProvider
            .getHttp()
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send({
                content: generateString(401),
            })
            .expect(HttpStatus.BAD_REQUEST_400);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK_200);
        expect(response.body).toEqual({
            id: comment_1.id,
            content: comment_1.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object),
        });
    });

    it('should not update comment 2 with AUTH of another user (403)', async () => {
        if (!comment_1) throw new Error('test cannot be performed');
        const data: CreateCommentInputModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 1',
        };

        await testingProvider
            .getHttp()
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader2)
            .send(data)
            .expect(HttpStatus.FORBIDDEN_403);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK_200);
        expect(response.body).toEqual({
            id: comment_1.id,
            content: comment_1.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object),
        });
    });

    it('should update comment 1 with correct AUTH', async () => {
        if (!comment_1) throw new Error('test cannot be performed');
        const data: CreateCommentInputModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 1',
        };

        await testingProvider
            .getHttp()
            .put(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.NO_CONTENT_204);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK_200);
        expect(response.body).toEqual({
            id: comment_1.id,
            content: data.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object),
        });
        comment_1.content = data.content;
    });

    it('DELETE/PUT should return 404 if :id from uri param not found', async () => {
        if (!comment_1) throw new Error('test cannot be performed');
        const data: CreateCommentInputModel = {
            content: 'NEW OUTSTANDING UPDATED COMMENT 222',
        };
        const randomId = new ObjectId().toString();

        await testingProvider
            .getHttp()
            .put(`${RouterPaths.comments}/${randomId}`)
            .set(authJWTHeader1)
            .send(data)
            .expect(HttpStatus.NOT_FOUND_404);

        await testingProvider
            .getHttp()
            .delete(`${RouterPaths.comments}/${randomId}`)
            .set(authJWTHeader1)
            .expect(HttpStatus.NOT_FOUND_404);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK_200);
        expect(response.body).toEqual({
            id: comment_1.id,
            content: comment_1.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object),
        });
    });

    it('should not delete comment_1 with AUTH of another user (403)', async () => {
        if (!comment_1) throw new Error('test cannot be performed');
        await testingProvider
            .getHttp()
            .delete(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader2)
            .expect(HttpStatus.FORBIDDEN_403);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.comments}/${comment_1.id}`)
            .expect(HttpStatus.OK_200);
        expect(response.body).toEqual({
            id: comment_1.id,
            content: comment_1.content,
            commentatorInfo: comment_1.commentatorInfo,
            createdAt: comment_1.createdAt,
            likesInfo: expect.any(Object),
        });
    });

    it('should delete comment 1 with correct AUTH and path', async () => {
        if (!comment_1 || !comment_2 || !post) throw new Error('test cannot be performed');

        await testingProvider
            .getHttp()
            .delete(`${RouterPaths.comments}/${comment_1.id}`)
            .set(authJWTHeader1)
            .expect(HttpStatus.NO_CONTENT_204);

        await testingProvider.getHttp().get(`${RouterPaths.comments}/${comment_1.id}`).expect(HttpStatus.NOT_FOUND_404);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200);
        expect(response.body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 1,
            items: [
                {
                    id: comment_2.id,
                    content: comment_2.content,
                    commentatorInfo: comment_2.commentatorInfo,
                    createdAt: comment_2.createdAt,
                    likesInfo: expect.any(Object),
                },
            ],
        });
    });
});
