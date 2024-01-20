import { ObjectId } from 'mongodb';

export type CommentatorInfoType = {
    userId: ObjectId;
    userLogin: string;
};
// export type  DbLikesInfoType = {
//     likesCount: number,
//     dislikesCount: number,
//     likes: likeForComment[] | []
// }
// export type likeForComment = {
//     userId: ObjectId,
//     likeStatus: LIKE_STATUS_DB_ENUM
// }
