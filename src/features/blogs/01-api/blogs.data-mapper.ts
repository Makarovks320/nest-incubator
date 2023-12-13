import {BlogMongoType} from '../types/dto';
import {BlogViewModel} from "../types/dto";
import {BlogDocument} from "../03-domain/blog-db-model";

export class BlogsDataMapper {
  constructor() {}

  static toBlogsView(items: BlogMongoType[] | BlogDocument[]): BlogViewModel[] {
    return items.map((item) => {
      return BlogsDataMapper.toBlogView(item);
    });
  }

  static toBlogView(blogDoc: BlogMongoType | BlogDocument): BlogViewModel {
    return {
      id: blogDoc._id.toString(),
      name: blogDoc.name,
      description: blogDoc.description,
      websiteUrl: blogDoc.websiteUrl,
      createdAt: blogDoc.createdAt?.toString(),
      isMembership: blogDoc.isMembership,
    };
  }
}
