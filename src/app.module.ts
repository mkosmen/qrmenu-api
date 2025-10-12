import {
  Module,
  MiddlewareConsumer,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthMiddleware } from './common/middleware/auth.middleware';
import { CoreModules } from './common/core.modules';
import { AuthModule } from './api/auth/auth.module';
import { UsersModule } from './api/users/users.module';
import { CompanyModule } from './api/company/company.module';
import { CategoryModule } from './api/category/category.module';
import { ProductModule } from './api/product/product.module';
import { DiscountModule } from './api/discount/discount.module';

@Module({
  imports: [
    CoreModules,
    AuthModule,
    UsersModule,
    CompanyModule,
    CategoryModule,
    ProductModule,
    DiscountModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .exclude(
        { path: 'auth/signin', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
      )
      .forRoutes('*');
  }
}
