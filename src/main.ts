import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { connect } from './lib/mongo/client';

async function bootstrap() {
  await connect();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
