import {IPost} from "./dto";

export type CreatePostByBlogsRouterInputModel = Pick<IPost, 'title' | 'shortDescription' | 'content'>;

export type CreatePostInputModel = CreatePostByBlogsRouterInputModel & {
    blogId: string
}

export type UpdatePostInputModel = CreatePostInputModel & {
    blogName: string
}

export type CreatePostModel = CreatePostInputModel & {
    blogName: string
}