import { LIKE_STATUS_DB_ENUM, LIKE_STATUS_ENUM, likesCountInfo, LikeStatusType } from '../03-domain/types';
import { Injectable } from '@nestjs/common';
import { Like, LikeModel } from '../03-domain/like-db-model';
import { LikesInfo } from '../../comments/01-api/models/output-models/CommentViewModel';
import { convertDbEnumToLikeStatus } from '../03-domain/like-status-converters';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikesQueryRepository {
    constructor(@InjectModel(Like.name) private likeModel: LikeModel) {}
    private async getLikesAndDislikesCountForComment(parentId: string): Promise<likesCountInfo> {
        try {
            const likesCount = await this.likeModel
                .countDocuments({
                    parent_id: parentId,
                    like_status: LIKE_STATUS_DB_ENUM.LIKE,
                })
                .lean();
            const dislikesCount = await this.likeModel
                .countDocuments({
                    parent_id: parentId,
                    like_status: LIKE_STATUS_DB_ENUM.DISLIKE,
                })
                .lean();

            return { likesCount: likesCount, dislikesCount: dislikesCount };
        } catch (error) {
            console.error('Error while getting likes count:', error);
            throw error;
        }
    }
    async getLikeForParentForCurrentUser(parent_id: string, user_id: string): Promise<Like | null> {
        return this.likeModel.findOne({ parent_id, user_id }).lean();
    }

    // метод, использованный до того, как лайки стали хранитьтся в комментах
    async getLikesInfo(parentId: string, userId: string): Promise<LikesInfo> {
        const likesCountInfo: likesCountInfo = await this.getLikesAndDislikesCountForComment(parentId);
        const myLike: Like | null = await this.getLikeForParentForCurrentUser(parentId, userId);
        let myStatus: LikeStatusType = LIKE_STATUS_ENUM.NONE;
        if (myLike) {
            myStatus = convertDbEnumToLikeStatus(myLike!.like_status);
        }
        const likesInfo: LikesInfo = { ...likesCountInfo, myStatus };
        return likesInfo;
    }

    // async findLikesForManyComments(comments: WithPagination<CommentDbType>, currentUserId: ObjectId): Promise<WithPagination<CommentViewModel>> {
    //     //todo: здесь ходить за лайками, а не брать из параметров
    //     const viewCommentsWithLikesInfoPromises: Promise<CommentViewModel>[] = comments.items.map(async c => {
    //         const likesCountInfo: likesCountInfo = await this.getLikesAndDislikesCountForComment(c._id);
    //         // todo: Promise.all
    //         // достать все лайки для каждого коммента - ?
    //         // при создании сохранять в коллекцию комментов общее количетво лайков и дизлайков
    //         const like: LikeDbModel | null = await this.getLikeForParentForCurrentUser(c._id, currentUserId);
    //         const result = getCommentViewModel(c, {
    //             likesCount: likesCountInfo.likesCount,
    //             dislikesCount: likesCountInfo.dislikesCount,
    //             myStatus: like ? convertDbEnumToLikeStatus(like.type) : 'None'
    //         })
    //         return result;
    //     });

    //     const commentsWithLikes: CommentViewModel[] = await Promise.all(viewCommentsWithLikesInfoPromises);
    //     return {
    //         pagesCount: comments.pagesCount,
    //         page: comments.page,
    //         pageSize: comments.pageSize,
    //         totalCount: comments.totalCount,
    //         items: commentsWithLikes
    //     }
    // }
}
