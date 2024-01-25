import { ObjectId } from 'mongodb';
import { LikesQueryRepository } from '../04-repositories/likes-query-repository';
import { Injectable } from '@nestjs/common';
import { LikesRepository } from '../04-repositories/likes-repository';
import { LikeStatusType, PARENT_TYPE_ENUM } from '../03-domain/types';
import { Like } from '../03-domain/like-db-model';
import { convertLikeStatusToDbEnum, convertParentTypeToDbEnum } from '../03-domain/like-status-converters';

@Injectable()
export class LikeService {
    constructor(
        private likesRepository: LikesRepository,
        private likesQueryRepository: LikesQueryRepository,
    ) {}
    async createNewLike(parentId: ObjectId, likeStatus: LikeStatusType, userId: ObjectId): Promise<Like> {
        const like: Like = {
            parent_type: convertParentTypeToDbEnum(PARENT_TYPE_ENUM.POST),
            parent_id: parentId,
            type: convertLikeStatusToDbEnum(likeStatus),
            user_id: userId,
        };
        return await this.likesRepository.createNewLike(like);
    }

    async changeLikeStatus(currentLike: Like, updateLikeStatus: LikeStatusType): Promise<Like> {
        const like: Like = {
            ...currentLike,
            parent_type: convertParentTypeToDbEnum(PARENT_TYPE_ENUM.COMMENT),
            type: convertLikeStatusToDbEnum(updateLikeStatus),
        };
        await this.likesRepository.updateLike(like);
        return like;
    }
}
