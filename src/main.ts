import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser(configService.get<string>('cookie.secret')));

  app.enableCors({
    origin: configService.get<string>('frontendUrl') ?? 'http://localhost:3001',
    credentials: true,
  });

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
  console.log(`🚀 API running on: http://localhost:${port}/api/v1`);
}
void bootstrap();
