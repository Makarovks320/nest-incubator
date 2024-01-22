import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { CheckCommentExists } from '../../../application/decorators/validation/CommentExistenceValidator';

export class CommentIdDto {
    @IsNotEmptyString()
    @CheckCommentExists()
    id: string;
}
