import { BlogQueryParams } from '../../features/blogs/types/query';
import { BlogInputQueryParams } from '../../features/blogs/types/dto';
import { PostQueryParams } from '../../features/posts/types/post-query-params-type';
import { PostInputQueryParams } from '../../features/posts/types/dto';
import { UsersInputQueryParams, UsersQueryParams } from '../../features/users/types/users-query-params';

export function getPostQueryParams(query: PostInputQueryParams): PostQueryParams {
    return new PostQueryParams(
        parseInt(query.pageNumber as string) || 1,
        parseInt(query.pageSize as string) || 10,
        (query.sortBy as string) || 'createdAt',
        query.sortDirection === 'asc' ? 'asc' : 'desc',
    );
}

export function getBlogQueryParams(queryParams: BlogInputQueryParams): BlogQueryParams {
    return new BlogQueryParams(
        parseInt(queryParams.pageNumber as string) || 1,
        parseInt(queryParams.pageSize as string) || 10,
        (queryParams.sortBy as string) || 'createdAt',
        queryParams.sortDirection === 'asc' ? 'asc' : 'desc',
        (queryParams.searchNameTerm as string) || null,
    );
}

export function getQueryParamsForUsers(queryParams: UsersInputQueryParams): UsersQueryParams {
    return new UsersQueryParams(
        parseInt(queryParams.pageNumber as string) || 1,
        parseInt(queryParams.pageSize as string) || 10,
        (queryParams.sortBy as string) || 'createdAt',
        queryParams.sortDirection === 'asc' ? 'asc' : 'desc',
        (queryParams.searchLoginTerm as string) || null,
        (queryParams.searchEmailTerm as string) || null,
    );
}
