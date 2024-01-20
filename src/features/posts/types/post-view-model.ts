import { LikeStatusType } from '../../likes/03-domain/like-db-model';

export type PostViewModel = {
    id: string;
    title: string;
    shortDescription: string;
    content: string;
    blogId: string;
    blogName: string;
    createdAt: string;
    extendedLikesInfo: ExtendedLikesInfoType;
};
export type ExtendedLikesInfoType = {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusType;
    newestLikes: NewestLikesType[] | [];
};
export type NewestLikesType = {
    addedAt: string;
    userId: string;
    login: string;
};
