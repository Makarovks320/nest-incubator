import { Injectable } from '@nestjs/common';
import {Blog, BlogDocument} from "../03-domain/blog-db-model";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {BlogViewModel, CreateBlogInputDto} from "../types/dto";
import {BlogsDataMapper} from "../01-api/blogs.data-mapper";

@Injectable()
export class BlogsRepository {
    constructor(
        @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    ) {
    }
    async save(blog: CreateBlogInputDto): Promise<BlogViewModel> {
        const createdBlog: BlogDocument = new this.blogModel(blog);//todo: этот конструктор работал даже когда я его не описал
        await createdBlog.save();
        return BlogsDataMapper.toBlogView(createdBlog);
    }
    async update(blog: BlogDocument): Promise<void> {
        await blog.save();
    }
  // async findBlogById(id: string): Promise<BlogDBModel | null> {
  //     return BlogModel.findOne({id}).select(DEFAULT_MONGOOSE_PROJECTION).lean();
  // }
  // async createNewBlog(b: BlogDBDto): Promise<BlogDBDto | string> {
  //   try {
  //     await BlogModel.insertMany(b);
  //     return b;
  //   } catch (e) {
  //     console.log(e);
  //     if (e instanceof MongooseError) return e.message;
  //     return 'Mongoose Error';
  //   }
  // }
  async clear(): Promise<void> {
      await this.blogModel.deleteMany({});
  }
  async deleteBlogById(_id: string): Promise<boolean> {
      const result = await this.blogModel.deleteOne({_id});
      return result.deletedCount === 1
  }
}
