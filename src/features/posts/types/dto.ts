import { PaginationQueryModel } from '../../../application/types/types';
import { Post } from '../03-domain/post-db-model';

export type PostInputQueryParams = PaginationQueryModel<Post> & {
    searchNameTerm?: string;
};
