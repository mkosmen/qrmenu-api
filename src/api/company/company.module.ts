import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CompanyMiddleware } from '@/common/middleware/company.middleware';

@Module({
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CompanyMiddleware)
      .exclude({
        path: 'company/all',
        method: RequestMethod.GET,
      })
      .forRoutes({ path: 'company/:id', method: RequestMethod.ALL });
  }
}
