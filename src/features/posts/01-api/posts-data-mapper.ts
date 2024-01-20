import { PostDocument } from '../03-domain/post-db-model';
import { PostMongoType } from '../types/dto';
import { PostViewModel } from '../types/post-view-model';
import { LIKE_STATUS_ENUM } from '../../likes/03-domain/like-db-model';

export class PostsDataMapper {
    constructor() {}
    static toPostView(postDoc: PostMongoType | PostDocument, myStatus: LIKE_STATUS_ENUM | null): PostViewModel {
        return {
            id: postDoc._id.toString(),
            title: postDoc.title,
            shortDescription: postDoc.shortDescription,
            content: postDoc.content,
            blogId: postDoc.blogId,
            blogName: postDoc.blogName,
            createdAt: postDoc.createdAt?.toISOString(),
            extendedLikesInfo: {
                likesCount: postDoc.likesCount,
                dislikesCount: postDoc.dislikesCount,
                myStatus: myStatus || LIKE_STATUS_ENUM.NONE,
                newestLikes: postDoc.newestLikes.map(l => {
                    return {
                        addedAt: l.addedAt,
                        userId: l.userId,
                        login: l.login,
                    };
                }),
            },
        };
    }
}
