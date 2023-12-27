import cookieParser from 'cookie-parser';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../filters/HttpExceptionFilter';

export function useAppSettings(app: INestApplication) {
    app.enableCors();
    app.use(cookieParser());
    app.useGlobalPipes(new ValidationPipe({// todo: можно этот класс расширить и кастомизировать, вынести в
        // отдельный файл
        transform: true,// преобразовывает инпуты контроллера в указанные там типы, в том числе в классы
        stopAtFirstError: true,
        //todo: здесь должна быть функция, которая принимает массив ошибок, а возвращает
        // ошибку в том виде, который соответствует нашему сваггеру
        // exceptionFactory: () => {
        //
        // }
    }));
    app.useGlobalFilters(new HttpExceptionFilter());
}
