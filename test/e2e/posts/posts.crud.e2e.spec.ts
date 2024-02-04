import { HttpStatus } from '../../../src/application/types/types';
import { authBasicHeader } from '../../utils/test_utilities';
import { blogsTestManager } from '../../utils/blogsTestManager';
import { ObjectId } from 'mongodb';
import { RouterPaths } from '../../../src/application/types/router-paths';
import { AppE2eTestingProvider, getTestingEnvironment } from '../../utils/get-testing-environment';
import { BlogViewModel, CreateBlogInputModel } from '../../../src/features/blogs/types/dto';
import { PostViewModel } from '../../../src/features/posts/types/post-view-model';
import { CreatePostInputModel } from '../../../src/features/posts/types/create-post-input-type';
import { postsTestManager } from '../../utils/postsTestManager';

describe('CRUD tests for /posts', () => {
    const testingProvider: AppE2eTestingProvider = getTestingEnvironment();

    it('should return an object with 0 totalCount', async () => {
        await testingProvider
            .getHttp()
            .get(RouterPaths.posts)
            .expect(HttpStatus.OK_200, { pagesCount: 0, page: 1, pageSize: 10, totalCount: 0, items: [] });
    });

    it(`shouldn't create post for unexisting blogId`, async () => {
        await testingProvider.getHttp().post(RouterPaths.posts).set(authBasicHeader).send({
            title: 'title 1',
            content: 'content 1',
            shortDescription: 'some short description',
            blogId: 'wrong blog id',
        });
        // .expect(HttpStatus.BAD_REQUEST_400,{
        //     errorsMessages: [ { message: 'blog is not found', field: 'blogId' } ]
        // });
    });

    // create blog + create post for blog
    let createdBlogForPost: BlogViewModel | null = null;
    let createdPost1: PostViewModel | null = null;
    it('should create new post for existing blogId', async () => {
        // сначала создадим блог
        const blogData: CreateBlogInputModel = {
            name: 'name test2',
            description: 'description test 2',
            websiteUrl: 'http://test.ru',
        };
        const { createdBlog } = await blogsTestManager.createBlog(blogData, HttpStatus.CREATED_201);
        createdBlogForPost = createdBlog;
        if (!createdBlogForPost) {
            throw new Error('test cannot be performed.');
        }
        //создадим пост для createdBlog.id
        const postData: CreatePostInputModel = {
            title: 'title 1',
            content: 'content 1',
            shortDescription: 'some short description',
            blogId: createdBlogForPost.id,
        };

        const { createdPost } = await postsTestManager.createPost(postData, HttpStatus.CREATED_201);
        createdPost1 = createdPost;
    });

    // create another post by '/blogs' router
    let createdPost2: PostViewModel | null = null;
    it('should create another post for the same blog', async () => {
        if (!createdBlogForPost) {
            throw new Error('test cannot be performed.');
        }

        const postData: CreatePostInputModel = {
            title: 'title 2',
            content: 'content 2',
            shortDescription: 'some short description 2',
            blogId: createdBlogForPost.id,
        };

        const { createdPost } = await postsTestManager.createPost(postData, HttpStatus.CREATED_201, true);
        createdPost2 = createdPost;
    });

    // update post
    it('should not update post if :id from uri param not found; status 404; ', async () => {
        if (!createdPost1 || !createdBlogForPost) throw new Error('test cannot be performed.');
        const updatedPostData: CreatePostInputModel = {
            title: 'updated title 2',
            content: 'updated content 2',
            shortDescription: 'updated some short description 2',
            blogId: createdBlogForPost.id,
        };

        await postsTestManager.updatePost(new ObjectId().toString(), updatedPostData, HttpStatus.NOT_FOUND_404);

        await postsTestManager.updatePost('unoformatted wrong id', updatedPostData, HttpStatus.NOT_FOUND_404);

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.blogs}/${createdBlogForPost.id}/posts`)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost2, createdPost1],
            });
    });

    it('should update post', async () => {
        if (!createdPost1 || !createdBlogForPost) throw new Error('test cannot be performed.');
        const updatedPostData: CreatePostInputModel = {
            title: 'updated title 1',
            content: 'updated content 1',
            shortDescription: 'updated some short description 1',
            blogId: createdBlogForPost.id,
        };

        await postsTestManager.updatePost(createdPost1.id.toString(), updatedPostData, HttpStatus.NO_CONTENT_204);

        const response = await testingProvider
            .getHttp()
            .get(`${RouterPaths.blogs}/${createdBlogForPost.id}/posts`)
            .expect(HttpStatus.OK_200);
        const body = response.body;
        expect(body).toEqual({
            pagesCount: 1,
            page: 1,
            pageSize: 10,
            totalCount: 2,
            items: [createdPost2, { ...createdPost1, ...updatedPostData }],
        });
        // обновляем пост во внешнем скоупе для следующих тест кейсов.
        createdPost1 = body.items[1];
    });

    it('should return error if :id from uri param not found; status 404;', async () => {
        const wrongBlogId = new ObjectId().toString();
        await testingProvider
            .getHttp()
            .get(`${RouterPaths.blogs}/${wrongBlogId}/posts`)
            .expect(HttpStatus.NOT_FOUND_404);
    });

    // create another blog + post
    let createdBlogForPost2: BlogViewModel | null = null;
    let createdPost3: PostViewModel | null = null;
    it('should get posts by special blog', async () => {
        const blogData: CreateBlogInputModel = {
            name: 'name test3',
            description: 'description test 3',
            websiteUrl: 'http://test.ru',
        };
        const { createdBlog } = await blogsTestManager.createBlog(blogData, HttpStatus.CREATED_201);
        createdBlogForPost2 = createdBlog;
        if (!createdBlogForPost || !createdBlogForPost2) {
            throw new Error('test cannot be performed.');
        }
        //создадим пост для второго блога
        const postData: CreatePostInputModel = {
            title: 'title 3',
            content: 'content 3',
            shortDescription: 'some short description',
            blogId: createdBlogForPost2.id,
        };

        const { createdPost } = await postsTestManager.createPost(postData, HttpStatus.CREATED_201);
        createdPost3 = createdPost;

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.posts}`)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 3,
                items: [createdPost3, createdPost2, createdPost1],
            });

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.blogs}/${createdBlogForPost.id}/posts`)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 2,
                items: [createdPost2, createdPost1],
            });

        await testingProvider
            .getHttp()
            .get(`${RouterPaths.blogs}/${createdBlogForPost2.id}/posts`)
            .expect(HttpStatus.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [createdPost3],
            });
    });
    // todo: PUT, POST, DELETE -> "/posts":
    //  should return error if auth credentials is incorrect; status 401; used additional methods: POST -> /blogs;
});
