import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../users/04-repositories/users-query-repository';
import jwt from 'jsonwebtoken';
import { ApiValidationError } from '../../../../application/errors/ApiValidationError';
import { FieldError } from '../../../../application/pipes/ClassValidationPipe';

@Injectable()
@ValidatorConstraint({ async: true })
export class RecoveryCodeValidator implements ValidatorConstraintInterface {
    constructor(private usersQueryRepo: UsersQueryRepository) {}
    async validate(code: string) {
        const user = await this.usersQueryRepo.findUserByPassRecoveryCode(code);
        const errors: FieldError[] = [];

        if (!user) {
            errors.push({ field: 'recoveryCode', message: 'Recovery code is incorrect' });
        } else if (user!.passwordRecovery.active) {
            errors.push({ field: 'recoveryCode', message: 'Recovery code has been activated' });
        }
        if (errors.length) throw new ApiValidationError(errors);

        // Check that the token is not expired
        try {
            await jwt.verify(code, process.env.JWT_SECRET!);
        } catch (e) {
            errors.push({ field: 'recoveryCode', message: 'Token is expired' });
            throw new ApiValidationError(errors);
        }

        return true;
    }
}

export function IsRecoveryCodeValid(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: 'IsRecoveryCodeValid',
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            async: true,
            validator: RecoveryCodeValidator,
        });
    };
}
