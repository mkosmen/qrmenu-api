import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n';
import * as path from 'node:path';

import { AppController } from './api/app/app.controller';
import { AppService } from './api/app/app.service';

import { AuthController } from './api/auth/auth.controller';
import { AuthService } from './api/auth/auth.service';

console.log('__dirname', __dirname);

@Module({
  imports: [
    ConfigModule.forRoot(),
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    JwtModule.register({ secret: process.env.JWT_SECRET }),
    CacheModule.registerAsync({
      useFactory: () => {
        return {
          stores: [
            new Keyv({
              store: new CacheableMemory({ ttl: 60000, lruSize: 5000 }),
            }),
            new KeyvRedis('redis://localhost:6379'),
          ],
        };
      },
    }),
  ],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
