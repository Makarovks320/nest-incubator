// import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../utils/withExternalQuery';
import {BlogMongoType, IBlog} from '../types/dto';
import {toIsoString} from "../../../utils/date";
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

  // static toBlogsView(items: BlogMongoType[]): BlogViewModel[] {
  //   return items.map((item) => {
  //     return BlogsDataMapper.toBlogView(item);
  //   });
  // }

  static toBlogView(blogDoc: BlogMongoType | BlogDocument): BlogViewModel {
    return {
      id: blogDoc._id.toString(),
      name: blogDoc.name,
      description: blogDoc.description,
      websiteUrl: blogDoc.websiteUrl,
      createdAt: toIsoString(blogDoc.createdAt),
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
