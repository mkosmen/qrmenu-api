if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  require('module-alias/register');
}

import { NestFactory } from '@nestjs/core';
import { I18nValidationPipe, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.useGlobalPipes(
    new I18nValidationPipe({
      whitelist: true,
      stopAtFirstError: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: true,
      responseBodyFormatter(
        host,
        exc,
        formattedErrors: { constraints: object; property: string }[],
      ) {
        const messages = {};
        formattedErrors.forEach((error) => {
          messages[error.property] = Object.values(error?.constraints);
        });

        return { status: false, messages };
      },
    }),
  );
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
