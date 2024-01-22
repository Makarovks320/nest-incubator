import { PaginationQueryModel } from '../../../../../application/types/types';
import { Comment } from '../../../03-domain/comment-db-model';

export type CommentInputQueryParams = PaginationQueryModel<Comment>;
