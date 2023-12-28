import cookieParser from 'cookie-parser';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './exception-filters/HttpExceptionFilter';
import { ClassValidationPipe } from './pipes/ClassValidationPipe';

export function useAppSettings(app: INestApplication) {
    app.enableCors();
    app.use(cookieParser());
    app.useGlobalPipes(new ClassValidationPipe());
    app.useGlobalFilters(new HttpExceptionFilter());
}
