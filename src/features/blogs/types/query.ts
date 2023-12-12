import {CommonQueryParams} from "../../../common/types/common-query-params";

export class BlogQueryParams implements CommonQueryParams {
    constructor (
        public pageNumber: number,
        public pageSize: number,
        public sortBy: string,
        public sortDirection: 'asc' | 'desc',
        public searchNameTerm: string | null
    ) { }
}