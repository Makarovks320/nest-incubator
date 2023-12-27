import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { BLOG_DESCRIPTION_MAX, BLOG_NAME_MAX, BLOG_WEB_URL_MAX } from './dto-variables';

export class UpdateBlogInputDto {
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
  @IsUrl()
  websiteUrl: string;
}
