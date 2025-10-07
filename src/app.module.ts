import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnApplicationShutdown,
  OnModuleInit,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { JwtModule } from '@nestjs/jwt';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';
import {
  I18nModule,
  AcceptLanguageResolver,
  HeaderResolver,
} from 'nestjs-i18n';
import * as path from 'node:path';
import { connect, client } from './lib/mongo/client';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        new HeaderResolver(['x-custom-lang']),
        AcceptLanguageResolver,
      ],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: '1h', lruSize: 5000 }),
            }),
            new KeyvRedis(
              `redis://${process.env.REDIS_HOST!}:${+process.env.REDIS_PORT!}`,
            ),
          ],
        };
      },
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      global: true,
    }),
    AuthModule,
    UsersModule,
  ],
  exports: [JwtModule],
})
export class AppModule
  implements OnApplicationShutdown, OnModuleInit, NestModule
{
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signin', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }

  onModuleInit() {
    connect()
      .then(() => {
        console.log('db connection success');
      })
      .catch((e) => {
        console.log('db connection error', e);
      });
  }
  onApplicationShutdown() {
    client
      .close()
      .then(() => {
        console.log('db connection closed success');
      })
      .catch((e) => {
        console.log('db connection closed error', e);
      });
  }
}
