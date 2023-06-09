import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { ApiModule } from './api.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import {
  AllExceptionsFilter,
  LoggingInterceptor,
  config,
  loggerWinston,
} from '@app/shared';

async function bootstrap() {
  const app = await NestFactory.create(ApiModule, {
    logger: loggerWinston,
  });

  const configService = app.get(ConfigService);
  const PORT = await configService.get('PORT');

  app.useGlobalInterceptors(new LoggingInterceptor());

  app.use(cookieParser());

  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);

  const SERVER_URL = await configService.get('SERVER_URL');

  await app.listen(PORT, '0.0.0.0', () => {
    console.info(`Server is running on port ${PORT}`);
    console.info(`Docs - ${SERVER_URL}/api/docs`);
  });
}

bootstrap();
