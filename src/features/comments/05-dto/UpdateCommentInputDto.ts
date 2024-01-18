import { MaxLength, MinLength } from 'class-validator';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from './dto.variables';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';

export class UpdateCommentInputDto {
    @IsNotEmptyString()
    @MinLength(COMMENT_CONTENT_MIN)
    @MaxLength(COMMENT_CONTENT_MAX)
    content: string;
}
