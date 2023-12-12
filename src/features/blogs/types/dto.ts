import {WithId} from "../../../common/types";

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