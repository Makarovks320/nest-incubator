import { LIKE_STATUS_ENUM } from '../03-domain/types';

export type PostLikeStatusInputModel = {
    postId: string;
    userId: string;
    status: LIKE_STATUS_ENUM;
};
