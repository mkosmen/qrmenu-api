import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { ProductService } from '@/api/product/product.service';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class ProductMiddleware implements NestMiddleware {
  constructor(
    private readonly i18n: I18nService,
    private readonly productService: ProductService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = <User>req.user;
    const id = req.params.id;

    const product = await this.productService.find({
      userId: user._id!,
      _id: new ObjectId(id),
    });

    if (!product) {
      throw new NotFoundException({
        message: this.i18n.t('custom.product.not_found'),
      });
    }

    req['product'] = product;

    next();
  }
}
