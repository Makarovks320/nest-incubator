import { Injectable } from '@nestjs/common';
import { CreatePostModel, UpdatePostInputModel } from '../types/create-post-input-type';
import { PostsRepository } from '../04-repositories/posts-repository';
import { Post, PostDocument } from '../03-domain/post-db-model';
import { PostViewModel } from '../types/post-view-model';

@Injectable()
export class PostService {
    constructor(private postsRepository: PostsRepository) {}

    // async getPosts(userId: ObjectId, queryParams: PostQueryParams, blogId?: string ): Promise<WithPagination<PostViewModel>> {
    //     const posts: WithPagination<PostDBType> = await this.postsQueryRepository.getPosts(queryParams, blogId);
    //     const promises = posts.items.map(p => {
    //         return this.likesQueryRepository.getLikeForParentForCurrentUser(p._id, userId);
    //     });
    //     const statuses: Array<LikeDbModel | null> = await Promise.all([...promises]).then(data => data);
    //     const arr: PostViewModel[] = posts.items.map((p, index) => {
    //         return {
    //             id: p._id.toString(),
    //             title: p.title,
    //             shortDescription: p.shortDescription,
    //             content: p.content,
    //             blogId: p.blogId,
    //             blogName: p.blogName,
    //             createdAt: p.createdAt,
    //             extendedLikesInfo: {
    //                 likesCount: p.likesCount,
    //                 dislikesCount: p.dislikesCount,
    //                 myStatus: statuses[index] ? convertDbEnumToLikeStatus(statuses[index]!.type)
    //                     : LIKE_STATUS_ENUM.NONE,
    //                 newestLikes: p.newestLikes.map(nl => {
    //                     return {
    //                         addedAt: nl.addedAt,
    //                         userId: nl.userId,
    //                         login: nl.login
    //                     }
    //                 })
    //             }
    //         }
    //     });
    //     return {
    //         ...posts,
    //         items: arr
    //     }
    //
    // }

    // async getPostById(id: string, userId: ObjectId): Promise<PostViewModel | null> {
    //     const postObjectId = stringToObjectIdMapper(id);
    //     const posts = await this.postsRepository.findPostById(postObjectId);
    //     // сходим за статусом лайка от текущего юзера, если текущий юзер авторизован
    //     let myStatus: LIKE_STATUS_ENUM | null = null;
    //     if (userId) {
    //         const myLike: LikeDbModel | null = await this.likesQueryRepository.getLikeForParentForCurrentUser(postObjectId, userId);
    //         if (myLike) myStatus = convertDbEnumToLikeStatus(myLike.type);
    //     }
    //
    //     return getPostViewModel(posts, myStatus)
    // }

    async createNewPost(p: CreatePostModel): Promise<PostViewModel> {
        const post: Post = Post.createPost(p);
        return await this.postsRepository.save(post);
    }

    async updatePostById(postId: string, newPostData: UpdatePostInputModel): Promise<boolean> {
        const post: PostDocument | null = await this.postsRepository.findPostById(postId);
        if (!post) return false;
        post.updatePost(newPostData);
        await this.postsRepository.save(post);
        return true;
    }

    async deleteAllPosts(): Promise<void> {
        await this.postsRepository.clear();
    }

    async deletePostById(postId: string): Promise<boolean> {
        return await this.postsRepository.deletePostById(postId);
    }
}
