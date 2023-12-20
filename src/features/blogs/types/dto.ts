import { PaginationQueryModel, WithId } from '../../../common/types';

export type IBlog = {
    name: string;
    description: string;
    websiteUrl: string;
    isMembership: boolean;
    createdAt: Date;
};

export type CreateBlogInputDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl'>;

export type UpdateBlogInputDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl'>;

export type BlogViewModel = Pick<IBlog, 'name' | 'description' | 'websiteUrl' | 'isMembership'> & {
    id: string;
    createdAt: string;
};

export type BlogMongoType = WithId<IBlog>;

export type BlogInputQueryParams = PaginationQueryModel<IBlog> & {
    searchNameTerm?: string;
};
