import { LikesQueryRepository } from '../04-repositories/likes-query-repository';
import { Injectable, NotFoundException } from '@nestjs/common';
import { LikesRepository } from '../04-repositories/likes-repository';
import { LikeStatusType } from '../03-domain/types';
import { Like, LikeDocument, LikeModel } from '../03-domain/like-db-model';
import { InjectModel } from '@nestjs/mongoose';
import { CreateLikeDto } from './types/CreateLikeDto';

@Injectable()
export class LikeService {
    constructor(
        private likesRepository: LikesRepository,
        private likesQueryRepository: LikesQueryRepository,
        @InjectModel(Like.name) private likeModel: LikeModel,
    ) {}
    async createNewLike(likeData: CreateLikeDto): Promise<LikeDocument> {
        const like: LikeDocument = this.likeModel.createLike(likeData);
        await this.likesRepository.save(like);
        return like;
    }

    async changeLikeStatus(currentLike: Like, updateLikeStatus: LikeStatusType): Promise<Like> {
        const like: LikeDocument | null = await this.likesRepository.getLikeDocumentForParentForUser(
            currentLike.parent_id,
            currentLike.user_id,
        );
        if (!like) throw new NotFoundException();
        like.updateLike({ status: updateLikeStatus });
        /* todo: сделать апдейт через save сущности LikeModel
            const like: LikeDocument | null = await this.likeModel.findOne({ _id });
            */
        return like;
    }
}
