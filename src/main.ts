import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { swaggerConfig } from './swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['verbose'],
    cors: true,
  });
  const logger = new Logger();

  app.useLogger(logger);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  swaggerConfig(app);
  await app.listen(process.env.APP_PORT);
}

bootstrap();
