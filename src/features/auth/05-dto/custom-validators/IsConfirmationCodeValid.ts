import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ApiValidationError } from '../../../../application/errors/ApiValidationError';
import { FieldError } from '../../../../application/pipes/ClassValidationPipe';
import { UsersRepository } from '../../../users/04-repositories/users-repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class ConfirmationCodeValidator implements ValidatorConstraintInterface {
    constructor(private usersRepository: UsersRepository) {}
    async validate(code: string) {
        const user = await this.usersRepository.findUserByConfirmationCodeOrEmail(code);
        const errors: FieldError[] = [];

        if (!user) {
            errors.push({ field: 'code', message: 'Confirmation code or email doesnt exist' });
        } else if (user!.emailConfirmation.isConfirmed) {
            errors.push({ field: 'code', message: 'User is already confirmed' });
        }
        if (errors.length) throw new ApiValidationError(errors);

        return true;
    }
}

export function IsConfirmationCodeValid(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsConfirmationCodeValid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: ConfirmationCodeValidator,
        });
    };
}
