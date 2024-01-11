import { ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { ApiValidationException } from '../exception-filters/exceptions/ApiValidationException';

export class ClassValidationPipe extends ValidationPipe {
    constructor() {
        super({
            transform: true,
            stopAtFirstError: true,
            exceptionFactory: ClassValidationPipe.createCustomExceptionFactory,
        });
    }

    static createCustomExceptionFactory(errors: ValidationError[]) {
        const fieldErrors: FieldError[] = [];
        errors.forEach(e => {
            if (!e.constraints) {
                return;
            }
            Object.keys(e.constraints).forEach(k => {
                if (!e.constraints) {
                    return;
                }
                fieldErrors.push({
                    message: e.constraints[k],
                    field: e.property,
                });
            });
        });

        throw new ApiValidationException(fieldErrors);
    }
}

export type FieldError = {
    field: string;
    message: string;
};
