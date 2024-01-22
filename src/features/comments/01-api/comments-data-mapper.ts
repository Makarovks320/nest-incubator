import { CommentDocument } from '../03-domain/comment-db-model';
import { CommentViewModel } from './models/output-models/CommentViewModel';
import { LIKE_STATUS_ENUM, LikeStatusType } from '../../likes/03-domain/types';
import { convertDbEnumToLikeStatus } from '../../likes/03-domain/like-status-converters';

export class CommentsDataMapper {
    getCommentViewModel(commentDocument: CommentDocument, userId: string | null = null): CommentViewModel {
        let myStatus: LikeStatusType = LIKE_STATUS_ENUM.NONE;
        if (userId) {
            const myLike = commentDocument.dbLikesInfo.likes.find(l => l.userId === userId); // todo: fix error
            if (myLike) myStatus = convertDbEnumToLikeStatus(myLike.likeStatus);
        }
        return {
            id: commentDocument._id.toString(),
            content: commentDocument.content,
            commentatorInfo: {
                userId: commentDocument.commentatorInfo.userId,
                userLogin: commentDocument.commentatorInfo.userLogin,
            },
            createdAt: commentDocument.createdAt.toISOString(),
            likesInfo: {
                likesCount: commentDocument.dbLikesInfo.likesCount,
                dislikesCount: commentDocument.dbLikesInfo.dislikesCount,
                myStatus: myStatus,
            },
        };
    }
}
