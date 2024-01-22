import { HttpStatus } from '../../../src/application/types/types';
import { RouterPaths } from '../../../src/application/types/router-paths';
import { AppE2eTestingProvider, arrangeTestingEnvironment } from '../../utils/arrange-testing-environment';
import { BlogViewModel, CreateBlogInputModel } from '../../../src/features/blogs/types/dto';
import { blogsTestManager } from '../../utils/blogsTestManager';
import { authBasicHeader, generateString } from '../../utils/test_utilities';
import { PostViewModel } from '../../../src/features/posts/types/post-view-model';
import { UserViewModel } from '../../../src/features/users/types/user-view-model';
import { postsTestManager } from '../../utils/postsTestManager';
import { usersTestManager } from '../../utils/usersTestManager';
import { CreatePostInputModel } from '../../../src/features/posts/types/create-post-input-type';
import { CreateUserInputDto } from '../../../src/features/users/05-dto/CreateUserInputDto';
import { CommentViewModel } from '../../../src/features/comments/01-api/models/output-models/CommentViewModel';
import { CreateCommentInputModel } from '../../../src/features/comments/01-api/models/input-models/CreateCommentInputModel';
import { commentsTestManager } from '../../utils/commentsTestManager';
import { ObjectId } from 'mongodb';

describe('/comments tests', () => {
    const testingProvider: AppE2eTestingProvider = arrangeTestingEnvironment();

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

        const dataUser: CreateUserInputDto = {
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

        const AccessToken1 = await testingProvider.getDaoUtils().jwtService.createAccessToken(user1.id);
        authJWTHeader1 = { Authorization: `Bearer ${AccessToken1}` };

        //Создаем юзера2, чтобы оставлять комменты

        const dataUser2: CreateUserInputDto = {
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

        const AccessToken2 = await testingProvider.getDaoUtils().jwtService.createAccessToken(user2.id);
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
        if (!post) throw new Error('test cannot be performed.');

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}/${post.id}/comments`)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it('should not create comment without AUTH', async () => {
        if (!post) throw new Error('test cannot be performed.');

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
        if (!post) throw new Error('test cannot be performed.');

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
});
