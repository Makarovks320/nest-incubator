import {BlogQueryParams} from "../features/blogs/types/query";
import {BlogPaginationQueryDto} from "../features/blogs/types/dto";
import {PostQueryParams} from "../features/posts/types/post-query-params-type";
import {PostPaginationQueryDto} from "../features/posts/types/dto";

export function getPostQueryParams (query: PostPaginationQueryDto): PostQueryParams {
    return new PostQueryParams(
        parseInt(query.pageNumber as string) || 1,
        parseInt(query.pageSize as string) || 10,
        query.sortBy as string || 'createdAt',
        query.sortDirection === 'asc' ? 'asc' : 'desc'
    )
}
export function getBlogQueryParams (queryParams: BlogPaginationQueryDto): BlogQueryParams {
    return new BlogQueryParams(
        parseInt(queryParams.pageNumber as string) || 1,
        parseInt(queryParams.pageSize as string) || 10,
        queryParams.sortBy as string || 'createdAt',
        queryParams.sortDirection === 'asc' ? 'asc' : 'desc',
        queryParams.searchNameTerm as string || null
    )
}
