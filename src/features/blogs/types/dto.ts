import {PaginationQueryModel, WithId, WithPaginationQuery} from "../../../common/types";

export type IBlog = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export type CreateBlogInputDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl'>;

export type UpdateBlogInputDto = Pick<IBlog, 'name' | 'description' | 'websiteUrl'>;

export type BlogViewModel = Pick<IBlog, 'name' | 'description' | 'websiteUrl' | 'isMembership'> & { id: string; createdAt: string };

export type BlogMongoType = WithId<IBlog>;

export type BlogPaginationQueryDto = PaginationQueryModel<IBlog> & {
  searchNameTerm?: string;
};

export type BlogQueryDto = WithPaginationQuery<IBlog> & { searchNameTerm: string | null };
