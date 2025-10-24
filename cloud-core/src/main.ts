import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/allExceptionFilters';
import { PrismaExceptionFilter } from './common/filters/prismaExceptionFilter';
import { ValidationPipe } from '@nestjs/common';
import fastifyCookie, { type FastifyCookieOptions } from '@fastify/cookie';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      bodyLimit: 10737418240, // 10GB
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  // app.useGlobalFilters(
  //   new AllExceptionsFilter(httpAdapterHost),
  //   new PrismaExceptionFilter(),
  // );

  // Registrar plugin de cookies do Fastify
  const fastifyInstance = app.getHttpAdapter().getInstance();
  await fastifyInstance.register(fastifyCookie as any, {
    secret: process.env.JWT_SECRET || 'my-secret',
  });

  // @ts-ignore - Required due to Fastify version mismatch
  await app.register(require('@fastify/multipart'), {
    limits: {
      fileSize: 10737418240, // 10GB
    },
  });

  // CORS configurado para aceitar cookies httpOnly do domain .tehkly.com
  app.enableCors({
    origin: ['http://localhost:3002', 'https://cloud.tehkly.com', 'https://auth.tehkly.com'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  });

  await app.listen(process.env.PORT ?? 4002, '0.0.0.0');
}
bootstrap();
