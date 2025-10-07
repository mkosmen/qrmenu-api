import { Module } from '@nestjs/common';
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
import { MongoDbModule } from '@/common/mongo/mongodb.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../i18n/'),
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
    MongoDbModule,
  ],
})
export class CoreModules {}
