import {PaginationQueryModel, WithId, WithPaginationQuery} from "../../../common/types";
// import {Blog} from "../03-domain/blog-db-model";

export type CreateBlogInputDto = {
  name: string;
  description: string;
  websiteUrl: string;
};
export type BlogViewModel = {
  id: string;
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: string;
};
export type IBlog = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export type BlogMongoType = WithId<IBlog>;

export type BlogPaginationQueryDto = PaginationQueryModel<IBlog> & {
  searchNameTerm?: string;
};

export type BlogQueryDto = WithPaginationQuery<IBlog> & { searchNameTerm: string | null };