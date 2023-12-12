import {BlogMongoType} from '../types/dto';
import {BlogViewModel} from "../types/dto";
import {BlogDocument} from "../03-domain/blog-db-model";

// const initialQuery: BlogPaginationRepositoryDto = {
//   sortBy: 'createdAt',
//   searchNameTerm: null,
//   sortDirection: 'desc',
//   pageNumber: 1,
//   pageSize: 10,
// };

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

  // static toRepoQuery(query: BlogPaginationQueryDto): BlogPaginationRepositoryDto {
  //   return {
  //     sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
  //     searchNameTerm: withExternalTerm(initialQuery.searchNameTerm, query.searchNameTerm),
  //     sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
  //     pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
  //     pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
  //   };
  // }
}
