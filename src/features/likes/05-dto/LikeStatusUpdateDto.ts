import { IsEnum } from 'class-validator';
import { LIKE_STATUS_ENUM } from '../03-domain/types';

export class LikeStatusUpdateDto {
    @IsEnum(LIKE_STATUS_ENUM)
    likeStatus: LIKE_STATUS_ENUM;
}
