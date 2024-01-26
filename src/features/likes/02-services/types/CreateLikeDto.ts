import { LikeStatusType, PARENT_TYPE_DB_ENUM } from '../../03-domain/types';

export type CreateLikeDto = {
    parentId: string;
    likeStatus: LikeStatusType;
    userId: string;
    parent_type: PARENT_TYPE_DB_ENUM;
};
