import { CommonQueryParams } from '../../../application/types/common-query-params';

export class PostQueryParams implements CommonQueryParams {
    constructor(
        public pageNumber: number,
        public pageSize: number,
        public sortBy: string,
        public sortDirection: 'asc' | 'desc',
    ) {}
}
