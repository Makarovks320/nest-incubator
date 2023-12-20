import { PaginationQueryModel, WithId } from '../../../common/types';
import { Post } from '../03-domain/post-db-model';

export type PostMongoType = WithId<Post>;

export type PostInputQueryParams = PaginationQueryModel<Post> & {
    searchNameTerm?: string;
};
