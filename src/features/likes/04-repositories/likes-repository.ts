import { Injectable } from '@nestjs/common';
import { Like, LikeDocument, LikeModel } from '../03-domain/like-db-model';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class LikesRepository {
    constructor(@InjectModel(Like.name) private likeModel: LikeModel) {}
    async save(like: LikeDocument): Promise<LikeDocument> {
        await like.save();
        return like;
    }

    async getLikeDocumentForParentForUser(parent_id: string, user_id: string): Promise<LikeDocument | null> {
        return this.likeModel.findOne({ parent_id, user_id });
    }
    // async updateLike(like: Like): Promise<boolean> {
    //     const result = await this.likeModel.updateOne().updateOne({ _id: like._id }, like);
    //     return result.modifiedCount === 1;
    // }
}
