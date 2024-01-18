import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { BLOG_DESCRIPTION_MAX, BLOG_NAME_MAX, BLOG_WEB_URL_MAX } from './dto-variables';

export class CreateBlogInputDto {
    @IsNotEmpty()
    @IsString()
    @MaxLength(BLOG_NAME_MAX)
    name: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(BLOG_DESCRIPTION_MAX)
    description: string;

    @IsNotEmpty()
    @IsString()
    @MaxLength(BLOG_WEB_URL_MAX)
    @IsUrl() //todo: законтрибьютить в class-validator воозможность прокидывать опцию {ignore_max_length: true}
    websiteUrl: string;
}
