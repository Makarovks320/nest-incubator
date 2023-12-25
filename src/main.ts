import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useAppSettings } from './application/utils/use-app-settings';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    useAppSettings(app);
    await app.listen(3000);
}
bootstrap();
