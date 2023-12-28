import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { Post, PostDocument } from '../03-domain/post-db-model';
import { PostMongoType } from '../types/dto';
import { PostViewModel } from '../types/post-view-model';
import { PostsDataMapper } from '../01-api/posts-data-mapper';
import { InjectModel } from '@nestjs/mongoose';
import { PostQueryParams } from '../types/post-query-params-type';
import { WithPagination } from '../../../application/types/types';

@Injectable()
export class PostsQueryRepository {
    constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
    async getPosts(queryParams: PostQueryParams, blogId?: string): Promise<WithPagination<PostViewModel>> {
        const filter: FilterQuery<Post> = {};
        if (blogId) {
            filter.blogId = blogId;
        }
        const sort: Record<string, 1 | -1> = {};
        if (queryParams.sortBy) {
            sort[queryParams.sortBy] = queryParams.sortDirection === 'asc' ? 1 : -1;
        }
        const posts: PostDocument[] = await this.postModel
            .find(filter)
            .lean()
            .sort(sort)
            .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
            .limit(queryParams.pageSize);

        const totalCount = await this.postModel.countDocuments(filter);
        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount: totalCount,
            items: posts.map(p => PostsDataMapper.toPostView(p, null)),
        };
    }
    async getPostById(id: string): Promise<PostViewModel | null> {
        try {
            const post: PostMongoType | null = await this.postModel.findById(id).lean();
            if (!post) return null;
            return PostsDataMapper.toPostView(post, null);
        } catch (e) {
            console.log(e);
            return null;
        }
    }
}
