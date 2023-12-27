import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { POST_CONTENT_MAX, POST_TITLE_MAX, SHORT_DESCRIPTION_MAX } from './dto.variables';

export class UpdatePostInputDto {
  blogId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(POST_TITLE_MAX)
  title: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(SHORT_DESCRIPTION_MAX)
  shortDescription: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(POST_CONTENT_MAX)
  content: string;
}
