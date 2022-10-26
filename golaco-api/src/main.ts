import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { BadRequestException } from './exceptions';
import { ValidationError } from 'class-validator';
import { readFileSync } from 'fs';
import { join } from 'path';
import * as yaml from 'js-yaml';

const logger = new Logger('GolaçoAPI');

const port = Number(process.env.PORT) | 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      exceptionFactory: (errors: ValidationError[]) =>
        new BadRequestException(errors.join(', ')),
    }),
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  const openApiYaml: OpenAPIObject = yaml.load(
    readFileSync(join(__dirname, 'resources', 'openapi.yaml'), 'utf8'),
  ) as OpenAPIObject;
  SwaggerModule.setup('api', app, openApiYaml);

  await app.listen(port);

  logger.log(`App is running at ${await app.getUrl()} 🚀`);
  logger.log(`Swagger is available at at ${await app.getUrl()}/api 🚀`);
}
bootstrap();
