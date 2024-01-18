import { IsUrl, MaxLength } from 'class-validator';
import { BLOG_DESCRIPTION_MAX, BLOG_NAME_MAX, BLOG_WEB_URL_MAX } from './dto-variables';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';

export class UpdateBlogInputDto {
    @IsNotEmptyString()
    @MaxLength(BLOG_NAME_MAX)
    name: string;

    @IsNotEmptyString()
    @MaxLength(BLOG_DESCRIPTION_MAX)
    description: string;

    @IsNotEmptyString()
    @MaxLength(BLOG_WEB_URL_MAX)
    @IsUrl()
    websiteUrl: string;
}
