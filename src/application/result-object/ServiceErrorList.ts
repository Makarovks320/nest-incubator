import { ResultErrorType, ResultObject } from './ResultObject';
import {
    ForbiddenException,
    InternalServerErrorException,
    NotFoundException,
    UnauthorizedException,
} from '@nestjs/common';

export enum ServiceErrorList {
    USER_NOT_FOUND,
    BLOG_NOT_FOUND,
    POST_NOT_FOUND,
    COMMENT_NOT_FOUND,
    COMMENT_ACCESS_DENIED,
    COMMENT_DELETE_ERROR,
    UNAUTHORIZED,
}
// todo: обработчик
export function handleResultObject(result: ResultObject<any>): void {
    if (!result.hasErrors()) return;

    const errors: ResultErrorType[] = result.getErrorCodes();

    // Пока не использовал накопление ошибок, поэтому непонятно, что делать в этом случае
    // if (errors.length > 1) throw new InternalServerErrorException();

    switch (errors[0].errorCode) {
        case ServiceErrorList.BLOG_NOT_FOUND:
        case ServiceErrorList.POST_NOT_FOUND:
        case ServiceErrorList.USER_NOT_FOUND:
        case ServiceErrorList.COMMENT_NOT_FOUND:
            throw new NotFoundException();

        case ServiceErrorList.COMMENT_ACCESS_DENIED:
            throw new ForbiddenException();

        case ServiceErrorList.COMMENT_DELETE_ERROR:
            throw new InternalServerErrorException();

        case ServiceErrorList.UNAUTHORIZED:
            throw new UnauthorizedException();

        default:
            throw new InternalServerErrorException();
    }
}
