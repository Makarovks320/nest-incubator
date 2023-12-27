import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';

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
    errors.forEach((e) => {
      if (!e.constraints) {
        return;
      }
      Object.keys(e.constraints).forEach((k) => {
        if (!e.constraints) {
          return;
        }
        fieldErrors.push({
          message: e.constraints[k],
          field: e.property,
        });
      });
    });

    throw new BadRequestException(fieldErrors);
  }
}

export type FieldError = {
  message: string;
  field: string;
};