import {PaginationQueryModel, WithId} from "../../../common/types";

export type IPost = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
};

export type UpdatePostInputDto = Pick<IPost, 'title' | 'shortDescription' | 'content'>;

export type PostMongoType = WithId<IPost>;

export type PostPaginationQueryDto = PaginationQueryModel<IPost> & {
  searchNameTerm?: string;
};
