import {UpdateResult} from 'mongodb';
import {Injectable} from '@nestjs/common';
import {Blog, BlogDocument} from "../03-domain/blog-db-model";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BlogViewModel, CreateBlogInputDto, UpdateBlogInputDto} from "../types/dto";
import {BlogsDataMapper} from "../01-api/blogs-data-mapper";

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    ) {
    }

    async save(blog: CreateBlogInputDto): Promise<BlogViewModel> {
        const createdBlog: BlogDocument = new this.blogModel(blog);
        await createdBlog.save();
        return BlogsDataMapper.toBlogView(createdBlog);
    }

    async getBlogById(id: string): Promise<Blog | null> {
        const blog: Blog | null = await this.blogModel.findById(id).lean();
        return blog;
    }

    async updateBlogById(id: string, blogNewData: UpdateBlogInputDto): Promise<boolean> {
        const res: UpdateResult = await this.blogModel.updateOne({_id: id}, {$set: blogNewData}).exec();
        return res.modifiedCount > 0;
    }

    async clear(): Promise<void> {
        await this.blogModel.deleteMany({});
    }

    async deleteBlogById(_id: string): Promise<boolean> {
        const result = await this.blogModel.deleteOne({_id});
        return result.deletedCount === 1
    }
}
