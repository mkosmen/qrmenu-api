import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { DiscountController } from './discount.controller';
import { DiscountService } from './discount.service';
import { DiscountMiddleware } from '@/common/middleware/discount.middleware';

@Module({
  controllers: [DiscountController],
  providers: [DiscountService],
})
export class DiscountModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(DiscountMiddleware)
      .exclude({
        path: 'discount/all',
        method: RequestMethod.GET,
      })
      .forRoutes({ path: 'discount/:id', method: RequestMethod.ALL });
  }
}
