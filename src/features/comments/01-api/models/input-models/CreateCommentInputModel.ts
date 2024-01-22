import { MaxLength, MinLength } from 'class-validator';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from '../../../05-dto/dto.variables';
import { IsNotEmptyString } from '../../../../../application/decorators/validation/IsNotEmptyString';

export class CreateCommentInputModel {
    @IsNotEmptyString()
    @MinLength(COMMENT_CONTENT_MIN)
    @MaxLength(COMMENT_CONTENT_MAX)
    content: string;
}
