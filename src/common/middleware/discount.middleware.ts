import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { DiscountService } from '@/api/discount/discount.service';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class DiscountMiddleware implements NestMiddleware {
  constructor(
    private readonly i18n: I18nService,
    private readonly discountService: DiscountService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = <User>req.user;
    const id = req.params.id;

    const discount = await this.discountService.find({
      userId: user._id!,
      _id: new ObjectId(id),
    });

    if (!discount) {
      throw new NotFoundException({
        message: this.i18n.t('custom.discount.not_found'),
      });
    }

    req['discount'] = discount;

    next();
  }
}
