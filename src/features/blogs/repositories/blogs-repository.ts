// import { DEFAULT_MONGOOSE_PROJECTION } from '../db/db';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogsRepository {
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
  // async updateBlogById(id: string, blog: BlogDBModel): Promise<boolean> {
  //     const result = await BlogModel.updateOne({id}, blog);
  //     return result.matchedCount === 1;
  // }
  // async deleteAllBlogs(): Promise<void> {
  //     await BlogModel.deleteMany({});
  // }
  // async deleteBlogById(id: string): Promise<boolean> {
  //     const result = await BlogModel.deleteOne({id});
  //     return result.deletedCount === 1
  // }
}
