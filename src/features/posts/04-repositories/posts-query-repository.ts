import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {Post, PostDocument} from "../03-domain/post-db-model";
import {PostMongoType} from "../types/dto";
import {PostViewModel} from "../types/post-view-model";
import {PostsDataMapper} from "../01-api/posts-data-mapper";
import {InjectModel} from "@nestjs/mongoose";
// import {WithPagination} from "../../../common/types";


@Injectable()
export class PostsQueryRepository {
  constructor(
      @InjectModel(Post.name) private postModel: Model<PostDocument>
  ) {}
//
//   async getBlogs (queryParams: BlogQueryParams): Promise<WithPagination<BlogViewModel>> {
//     const sort: Record<string, -1 | 1> = {};
//     if (queryParams.sortBy) {
//       sort[queryParams.sortBy] = queryParams.sortDirection === 'asc' ? 1 : -1;
//     }
//     const filter: FilterQuery<Blog> = {};
//     if (queryParams.searchNameTerm != null) {
//       filter.name = { $regex: queryParams.searchNameTerm, $options: 'i' };
//     }
//     const blogs: BlogDocument[] = await this.blogModel.find(filter)
//         .sort(sort)
//         .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
//         .limit(queryParams.pageSize)
//     const totalCount = await this.blogModel.countDocuments();
//
//     return {
//       pagesCount: Math.ceil(totalCount / queryParams.pageSize),
//       page: queryParams.pageNumber,
//       pageSize: queryParams.pageSize,
//       totalCount: totalCount,
//       items: BlogsDataMapper.toBlogsView(blogs)
//     }
//   }
//
  async getPostById(id: string): Promise<PostViewModel | null> {
    try{
      const post: PostMongoType | null = await this.postModel.findById(id).lean();
      if (!post) return null;
      return PostsDataMapper.toPostView(post);
    } catch (e) {
      console.log(e);
      return null;
    }
  }
}
