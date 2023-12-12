// import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../utils/withExternalQuery';
import { BlogMongoType } from '../types/dto';
import {toIsoString} from "../../../utils/date";
import {BlogViewModel} from "../types/dto";

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

  static toBlogView(item: BlogMongoType): BlogViewModel {
    return {
      id: item._id.toString(),
      name: item.name,
      description: item.description,
      websiteUrl: item.websiteUrl,
      createdAt: toIsoString(item.createdAt),
      isMembership: item.isMembership,
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
