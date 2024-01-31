import { ResultObjectError } from './ResultObjectError';

export type ResultErrorType = {
    errorMessage?: string;
    errorCode: number | null;
};
export class ResultObject<T = null> {
    constructor(
        private data: T | null = null,
        private errors: ResultErrorType[] = [],
    ) {}
    setData(data: T): void {
        this.data = data;
    }
    getData(): T | null {
        if (this.data === null) {
            throw new ResultObjectError();
        }
        return this.data;
    }
    addError(error: ResultErrorType): void {
        this.errors.push(error);
    }
    hasErrorCode(errorCode: number): boolean {
        return this.errors.map(e => e.errorCode).includes(errorCode);
    }
    hasErrors(): boolean {
        return this.errors.length > 0;
    }
    getErrorCodes() {
        return this.errors;
    }
}
