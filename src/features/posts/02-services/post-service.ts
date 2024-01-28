import { Injectable } from '@nestjs/common';
import { CreatePostModel, UpdatePostInputModel } from '../types/create-post-input-type';
import { PostsRepository } from '../04-repositories/posts-repository';
import { Post, PostDocument, PostModel } from '../03-domain/post-db-model';
import { PostViewModel } from '../types/post-view-model';
import { LikeForPostInputModel } from '../../likes/01-api/models/input-models/LikeForPostInputModel';
import { ResultObject } from '../../../application/result-object/ResultObject';
import { UsersRepository } from '../../users/04-repositories/users-repository';
import { UserDocument } from '../../users/03-domain/user-db-model';
import { Like } from '../../likes/03-domain/like-db-model';
import { LikesQueryRepository } from '../../likes/04-repositories/likes-query-repository';
import { LikeService } from '../../likes/02-services/like-service';
import { LIKE_STATUS_ENUM, PARENT_TYPE_DB_ENUM } from '../../likes/03-domain/types';
import { convertLikeStatusToDbEnum } from '../../likes/03-domain/like-status-converters';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class PostService {
    constructor(
        private postsRepository: PostsRepository,
        private usersRepo: UsersRepository,
        private likesQueryRepository: LikesQueryRepository,
        private likeService: LikeService,
        @InjectModel(Post.name) private postModel: PostModel,
    ) {}

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
        const post: Post = this.postModel.createPost(p);
        return await this.postsRepository.save(post);
    }

    async updatePostById(postId: string, newPostData: UpdatePostInputModel): Promise<boolean> {
        const post: PostDocument | null = await this.postsRepository.findPostById(postId);
        if (!post) return false;
        post.updatePost(newPostData);
        await this.postsRepository.save(post);
        return true;
    }
    async CreateOrUpdateLike(input: LikeForPostInputModel): Promise<ResultObject> {
        const result = new ResultObject();

        const user: UserDocument | null = await this.usersRepo.findUserById(input.userId);
        if (user == null) {
            result.addError({ errorCode: PostLikeServiceError.UNAUTHORIZED });
            return result;
        }

        const post: PostDocument | null = await this.postsRepository.findPostById(input.postId);
        if (post === null) {
            result.addError({ errorCode: PostLikeServiceError.POST_NO_FOUND });
            return result;
        }

        // получаем имя пользователя
        const userLogin: string = user.login;

        // получим лайк для данного поста от текущего пользователя, если он есть
        const previousLike: Like | null = await this.likesQueryRepository.getLikeForParentForCurrentUser(
            input.postId,
            input.userId,
        );

        let newOrUpdatedLike: Like | null = null;
        if (previousLike) {
            newOrUpdatedLike = await this.likeService.changeLikeStatus(previousLike, input.status);
            post.extractLikeFromList(previousLike);
            post.recalculateLikesCount(input.status, previousLike.like_status);
        } else {
            newOrUpdatedLike = await this.likeService.createNewLike({
                parent_id: input.postId,
                like_status: convertLikeStatusToDbEnum(input.status),
                user_id: input.userId,
                parent_type: PARENT_TYPE_DB_ENUM.POST,
            });
            post.recalculateLikesCount(input.status);
        }
        if (input.status === LIKE_STATUS_ENUM.LIKE) {
            post.insertNewLikeToList(newOrUpdatedLike.updatedAt, input.userId, userLogin);
        }
        await this.postsRepository.save(post);
        return result;
    }
    async deleteAllPosts(): Promise<void> {
        await this.postsRepository.clear();
    }

    async deletePostById(postId: string): Promise<boolean> {
        return await this.postsRepository.deletePostById(postId);
    }
}

export enum PostLikeServiceError {
    UNAUTHORIZED,
    POST_NO_FOUND,
}
