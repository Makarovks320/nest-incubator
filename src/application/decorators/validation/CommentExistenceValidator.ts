import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentsQueryRepository } from '../../../features/comments/04-repositories/comments-query-repository';
import { Types } from 'mongoose';

@Injectable()
@ValidatorConstraint({ async: true })
export class CommentExistenceValidator implements ValidatorConstraintInterface {
    constructor(private commentsQueryRepo: CommentsQueryRepository) {}

    async validate(commentId: string) {
        try {
            new Types.ObjectId(commentId);
        } catch (error) {
            return false;
        }

        const comment = await this.commentsQueryRepo.getCommentById(commentId);

        if (!comment) throw new NotFoundException();

        return true;
    }
}

export function CheckCommentExists(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'CheckCommentExists',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: CommentExistenceValidator,
        });
    };
}
