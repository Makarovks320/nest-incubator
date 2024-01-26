import { LIKE_STATUS_ENUM } from '../../../03-domain/types';

export type LikeForPostInputModel = {
    postId: string;
    userId: string;
    status: LIKE_STATUS_ENUM;
};
