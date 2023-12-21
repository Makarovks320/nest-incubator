import { Post } from '../03-domain/post-db-model';

export type CreatePostByBlogsRouterInputModel = Pick<Post, 'title' | 'shortDescription' | 'content'>;

export type CreatePostInputModel = CreatePostByBlogsRouterInputModel & {
    blogId: string;
};

export type UpdatePostInputModel = CreatePostInputModel;

export type CreatePostModel = CreatePostInputModel & {
    blogName: string;
};
