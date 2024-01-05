import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from './dto.variables';

export class CreateCommentInputDto {
    @IsNotEmpty()
    @IsString()
    @MinLength(COMMENT_CONTENT_MIN)
    @MaxLength(COMMENT_CONTENT_MAX)
    content: string;
}
