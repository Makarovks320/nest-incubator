// с 10 по 20 - ошибки для мэйлера, например. А общие ошибки вынести куда-то в общую папку. Нот фаунд будет
// одинаковым и для постов и для юзеров
export enum ServiceErrorList {
    USER_NOT_FOUND,
    BLOG_NOT_FOUND,
    POST_NOT_FOUND,
    COMMENT_NOT_FOUND,
    COMMENT_ACCESS_DENIED,
    COMMENT_DELETE_ERROR,
    UNAUTHORIZED,
}
