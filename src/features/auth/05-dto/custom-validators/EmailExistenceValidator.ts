import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ApiValidationError } from '../../../../application/errors/ApiValidationError';
import { UsersRepository } from '../../../users/04-repositories/users-repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class EmailExistenceValidator implements ValidatorConstraintInterface {
    constructor(private usersRepo: UsersRepository) {}

    async validate(email: string) {
        const user = await this.usersRepo.findUserByLoginOrEmail(email);

        if (!user) {
            throw new ApiValidationError([{ field: 'email', message: 'email does not exist' }]);
        }

        return true;
    }
}

export function IsEmailRegistered(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsEmailRegistered',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: EmailExistenceValidator,
        });
    };
}
