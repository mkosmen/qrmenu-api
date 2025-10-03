import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './api/app/app.controller';
import { AppService } from './api/app/app.service';

import { AuthController } from './api/auth/auth.controller';
import { AuthService } from './api/auth/auth.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController, AuthController],
  providers: [AppService, AuthService],
})
export class AppModule {}
