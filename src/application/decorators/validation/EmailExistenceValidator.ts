import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { ApiValidationException } from '../../exception-filters/exceptions/ApiValidationException';
import { UsersRepository } from '../../../features/users/04-repositories/users-repository';
import { FieldError } from '../../pipes/ClassValidationPipe';

@Injectable()
@ValidatorConstraint({ async: true })
export class EmailExistenceValidator implements ValidatorConstraintInterface {
    constructor(private usersRepo: UsersRepository) {}

    async validate(email: string) {
        const user = await this.usersRepo.findUserByLoginOrEmail(email);
        const errors: FieldError[] = [];

        if (!user) {
            errors.push({ field: 'email', message: 'email does not exist' });
        } else if (user.emailConfirmation.isConfirmed) {
            errors.push({ field: 'email', message: 'email is already confirmed' });
        }
        if (errors.length) throw new ApiValidationException(errors);

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
