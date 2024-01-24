import { LIKE_STATUS_DB_ENUM } from '../../likes/03-domain/types';

export type CommentatorInfoType = {
    userId: string;
    userLogin: string;
};
export type DbLikesInfoType = {
    likesCount: number;
    dislikesCount: number;
    likes: LikeForCommentType[];
};
export type LikeForCommentType = {
    userId: string;
    likeStatus: LIKE_STATUS_DB_ENUM;
};
