import { ObjectId } from 'mongoose';

export enum HttpStatus {
    OK_200 = 200,
    CREATED_201 = 201,
    NO_CONTENT_204 = 204,

    BAD_REQUEST_400 = 400,
    NOT_FOUND_404 = 404,
    UNAUTHORIZED_401 = 401,
    FORBIDDEN_403 = 403,
    DB_ERROR = 409,
    TOO_MANY_REQUESTS_429 = 429,

    SERVER_ERROR_500 = 500,
}

// ключи объекта типа HTTP_STATUSES
type HttpStatusKeys = keyof typeof HttpStatus

// значения объекта типа HttpStatus, например, любое число
// или ссылка на значение через путь, например, const b: HttpStatusType = HttpStatus.OK_200;
export type HttpStatusType = (typeof HttpStatus)[HttpStatusKeys]

export type WithId<T> = T & {
    _id: ObjectId;
};

export type SortingDirection = 'asc' | 'desc';

export type WithPaginationQuery<T> = {
    sortBy: Extract<keyof T, string>;
    sortDirection: SortingDirection;
    pageNumber: number;
    pageSize: number;
};

export type WithPaginationResult<T> = {
    totalCount: number;
    items: T[];
};

export type WithPagination<T> = {
    pagesCount: number;
    page: number;
    pageSize: number;
    totalCount: number;
    items: T[];
};

export interface PaginationQueryModel<T extends object> {
    sortBy?: Extract<keyof T, string>;
    sortDirection?: string;
    pageNumber?: string;
    pageSize?: string;
}
