import cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';
import { HttpExceptionFilter } from './exception-filters/HttpExceptionFilter';
import { ClassValidationPipe } from './pipes/ClassValidationPipe';
import { useContainer } from 'class-validator';
import { AppModule } from '../app.module';

export function useAppSettings(app: INestApplication) {
    app.use(cookieParser());
    useContainer(app.select(AppModule), { fallbackOnErrors: true });
    app.useGlobalPipes(new ClassValidationPipe());
    app.enableCors();
    app.useGlobalFilters(new HttpExceptionFilter());
}
