import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { CategoryMiddleware } from '@/common/middleware/category.middleware';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(CategoryMiddleware)
      .exclude({
        path: 'category/all',
        method: RequestMethod.GET,
      })
      .forRoutes(
        { path: 'category/:id', method: RequestMethod.ALL },
        { path: 'category/:id/{*s}', method: RequestMethod.ALL },
      );
  }
}
