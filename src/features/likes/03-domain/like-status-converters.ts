import {
    LIKE_STATUS_DB_ENUM,
    LIKE_STATUS_ENUM,
    LikeStatusType,
    PARENT_TYPE_DB_ENUM,
    PARENT_TYPE_ENUM,
    ParentTypeValues,
} from './types';

export function convertLikeStatusToDbEnum(likeStatus: LikeStatusType): LIKE_STATUS_DB_ENUM {
    switch (likeStatus) {
        case 'Like':
            return LIKE_STATUS_DB_ENUM.LIKE;
        case 'Dislike':
            return LIKE_STATUS_DB_ENUM.DISLIKE;
        case 'None':
            return LIKE_STATUS_DB_ENUM.NONE;
        default:
            throw new Error('Invalid LikeStatusType');
    }
}

export function convertDbEnumToLikeStatus(dbEnumValue: LIKE_STATUS_DB_ENUM): LikeStatusType {
    switch (dbEnumValue) {
        case LIKE_STATUS_DB_ENUM.LIKE:
            return LIKE_STATUS_ENUM.LIKE;
        case LIKE_STATUS_DB_ENUM.DISLIKE:
            return LIKE_STATUS_ENUM.DISLIKE;
        case LIKE_STATUS_DB_ENUM.NONE:
            return LIKE_STATUS_ENUM.NONE;
        default:
            throw new Error('Invalid LikeStatusDbEnum');
    }
}

export function convertParentTypeToDbEnum(parentType: ParentTypeValues): PARENT_TYPE_DB_ENUM {
    switch (parentType) {
        case PARENT_TYPE_ENUM.POST:
            return PARENT_TYPE_DB_ENUM.POST;
        case PARENT_TYPE_ENUM.COMMENT:
            return PARENT_TYPE_DB_ENUM.COMMENT;
        default:
            throw new Error('Invalid LikeStatusType');
    }
}

export function convertDbEnumToParentType(dbEnumValue: PARENT_TYPE_DB_ENUM): ParentTypeValues {
    switch (dbEnumValue) {
        case PARENT_TYPE_DB_ENUM.POST:
            return PARENT_TYPE_ENUM.POST;
        case PARENT_TYPE_DB_ENUM.COMMENT:
            return PARENT_TYPE_ENUM.COMMENT;
        default:
            throw new Error('Invalid LikeStatusType');
    }
}
