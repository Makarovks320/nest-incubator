import {BlogQueryParams} from "../features/blogs/types/query";
import {BlogPaginationQueryDto} from "../features/blogs/types/dto";

// export function getPostQueryParams (req: Request): PostQueryParams {
//     return new PostQueryParams(
//         parseInt(req.query.pageNumber as string) || 1,
//         parseInt(req.query.pageSize as string) || 10,
//         req.query.sortBy as string || 'createdAt',
//         req.query.sortDirection === 'asc' ? 'asc' : 'desc'
//     )
// }
export function getBlogQueryParams (queryParams: BlogPaginationQueryDto): BlogQueryParams {
    return new BlogQueryParams(
        parseInt(queryParams.pageNumber as string) || 1,
        parseInt(queryParams.pageSize as string) || 10,
        queryParams.sortBy as string || 'createdAt',
        queryParams.sortDirection === 'asc' ? 'asc' : 'desc',
        queryParams.searchNameTerm as string || null
    )
}
