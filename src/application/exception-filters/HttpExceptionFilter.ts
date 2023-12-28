import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ApiValidationError } from '../errors/ApiValidationError';

@Catch(ApiValidationError)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: ApiValidationError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        response.status(status).send({
            errors: exception.errors,
        });
    }
}