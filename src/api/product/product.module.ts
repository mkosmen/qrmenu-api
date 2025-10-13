import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { CategoryModule } from '../category/category.module';
import { ProductMiddleware } from '@/common/middleware/product.middleware';

@Module({
  imports: [CategoryModule],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(ProductMiddleware)
      .exclude({
        path: 'product/all',
        method: RequestMethod.GET,
      })
      .forRoutes(
        { path: 'product/:id', method: RequestMethod.ALL },
        { path: 'product/:id/{*s}', method: RequestMethod.ALL },
      );
  }
}
