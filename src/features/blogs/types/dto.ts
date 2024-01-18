import { PaginationQueryModel, WithId } from '../../../application/types/types';
import { Blog } from '../03-domain/blog-db-model';

export type CreateBlogInputModel = Pick<Blog, 'name' | 'description' | 'websiteUrl'>;

export type UpdateBlogInputModel = Pick<Blog, 'name' | 'description' | 'websiteUrl'>;

export type BlogViewModel = Pick<Blog, 'name' | 'description' | 'websiteUrl' | 'isMembership'> & {
    id: string;
    createdAt: string;
};

export type BlogMongoType = WithId<Blog>;

export type BlogInputQueryParams = PaginationQueryModel<Blog> & {
    searchNameTerm?: string;
};
