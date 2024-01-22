import { LikeStatusType } from '../../../../likes/03-domain/types';

export type CommentViewModel = {
    id: string;
    content: string;
    commentatorInfo: {
        userId: string;
        userLogin: string;
    };
    createdAt: string;
    likesInfo: LikesInfo;
};

export type LikesInfo = {
    likesCount: number;
    dislikesCount: number;
    myStatus: LikeStatusType;
};
