import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Response } from 'express';
import { ApiValidationException } from './exceptions/ApiValidationException';

@Catch(ApiValidationException)
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: ApiValidationException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const status = exception.getStatus();

        response.status(status).send({
            errorsMessages: exception.errors,
        });
    }
}
