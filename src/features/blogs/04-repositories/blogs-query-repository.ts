import 'reflect-metadata'; //todo: нужен?
import { FilterQuery, Model, MongooseError } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogDocument } from '../03-domain/blog-db-model';
import { BlogMongoType, BlogViewModel } from '../types/dto';
import { BlogsDataMapper } from '../01-api/blogs-data-mapper';
import { WithPagination } from '../../../application/types/types';
import { BlogQueryParams } from '../types/query';

@Injectable()
export class BlogsQueryRepository {
    constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

    async getBlogs(queryParams: BlogQueryParams): Promise<WithPagination<BlogViewModel>> {
        const sort: Record<string, -1 | 1> = {};
        if (queryParams.sortBy) {
            sort[queryParams.sortBy] = queryParams.sortDirection === 'asc' ? 1 : -1;
        }
        const filter: FilterQuery<Blog> = {};
        if (queryParams.searchNameTerm != null) {
            filter.name = { $regex: queryParams.searchNameTerm, $options: 'i' };
        }
        const blogs: BlogDocument[] = await this.blogModel
            .find(filter)
            .sort(sort)
            .skip((queryParams.pageNumber - 1) * queryParams.pageSize)
            .limit(queryParams.pageSize);
        const totalCount = await this.blogModel.countDocuments(filter);

        return {
            pagesCount: Math.ceil(totalCount / queryParams.pageSize),
            page: queryParams.pageNumber,
            pageSize: queryParams.pageSize,
            totalCount: totalCount,
            items: BlogsDataMapper.toBlogsView(blogs),
        };
    }

    async getBlogById(id: string): Promise<BlogViewModel | null> {
        try {
            const blog: BlogMongoType | null = await this.blogModel.findById(id).lean();
            if (!blog) return null;
            return BlogsDataMapper.toBlogView(blog);
        } catch (e) {
            if (e instanceof MongooseError) console.log(e.message);
            console.log(e);
            return null;
        }
    }
}
