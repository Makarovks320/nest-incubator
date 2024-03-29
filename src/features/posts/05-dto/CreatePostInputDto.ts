import { MaxLength } from 'class-validator';
import { POST_CONTENT_MAX, POST_TITLE_MAX, SHORT_DESCRIPTION_MAX } from './dto.variables';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { IsBlogExist } from '../../../application/decorators/validation/IsBlogExist';

export class CreatePostInputDto {
    @IsBlogExist()
    blogId: string;

    @IsNotEmptyString()
    @MaxLength(POST_TITLE_MAX)
    title: string;

    @IsNotEmptyString()
    @MaxLength(SHORT_DESCRIPTION_MAX)
    shortDescription: string;

    @IsNotEmptyString()
    @MaxLength(POST_CONTENT_MAX)
    content: string;
}
