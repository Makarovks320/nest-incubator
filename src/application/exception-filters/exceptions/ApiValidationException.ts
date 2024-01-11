import { BadRequestException } from '@nestjs/common';
import { FieldError } from '../../pipes/ClassValidationPipe';

export class ApiValidationException extends BadRequestException {
    constructor(public readonly errors: FieldError[]) {
        super();
    }
}
