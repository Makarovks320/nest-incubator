import { BadRequestException } from '@nestjs/common';
import { FieldError } from '../pipes/ClassValidationPipe';

export class ApiValidationError extends BadRequestException {
    constructor(public readonly errors: FieldError[]) {
        super();
    }
}