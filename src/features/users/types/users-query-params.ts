import { PaginationQueryModel } from '../../../common/types';
import { User } from '../03-domain/user-db-model';
import { CommonQueryParams } from '../../../common/types/common-query-params';

export type UsersInputQueryParams = PaginationQueryModel<User> & {
    searchLoginTerm?: string;
    searchEmailTerm?: string;
};

export class UsersQueryParams implements CommonQueryParams {
    constructor(
        public pageNumber: number,
        public pageSize: number,
        public sortBy: string,
        public sortDirection: SortDirection,
        public searchLoginTerm: string | null,
        public searchEmailTerm: string | null,
    ) {}
}

export type SortDirection = 'asc' | 'desc';
