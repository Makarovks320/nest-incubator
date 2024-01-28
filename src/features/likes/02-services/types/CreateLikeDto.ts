import { LIKE_STATUS_DB_ENUM, PARENT_TYPE_DB_ENUM } from '../../03-domain/types';

export type CreateLikeDto = {
    parent_id: string;
    like_status: LIKE_STATUS_DB_ENUM;
    user_id: string;
    parent_type: PARENT_TYPE_DB_ENUM;
};
