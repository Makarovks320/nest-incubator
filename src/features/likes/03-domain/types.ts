export enum PARENT_TYPE_ENUM {
    COMMENT = 'comment',
    POST = 'post',
}
type ParentTypeKeys = keyof typeof PARENT_TYPE_ENUM;
export type ParentTypeValues = (typeof PARENT_TYPE_ENUM)[ParentTypeKeys];
export enum PARENT_TYPE_DB_ENUM {
    COMMENT,
    POST,
}

export enum LIKE_STATUS_ENUM {
    LIKE = 'Like',
    DISLIKE = 'Dislike',
    NONE = 'None',
}
export type LikeStatusType = LIKE_STATUS_ENUM.LIKE | LIKE_STATUS_ENUM.DISLIKE | LIKE_STATUS_ENUM.NONE;
export enum LIKE_STATUS_DB_ENUM {
    LIKE,
    DISLIKE,
    NONE,
}

export type likesCountInfo = { likesCount: number; dislikesCount: number };
