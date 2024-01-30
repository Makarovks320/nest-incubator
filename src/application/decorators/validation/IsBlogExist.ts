import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { BlogsQueryRepository } from '../../../features/blogs/04-repositories/blogs-query-repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsBlogIdExistValidator implements ValidatorConstraintInterface {
    constructor(private blogsQueryRepo: BlogsQueryRepository) {}

    validate(blogId: string) {
        return this.blogsQueryRepo.getBlogById(blogId).then(blog => {
            return !!blog;
        });
    }

    defaultMessage(): string {
        return `Blog id does not exist`;
    }
}

export function IsBlogExist(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsBlogExist',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: IsBlogIdExistValidator,
        });
    };
}
