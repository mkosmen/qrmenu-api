import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { CategoryService } from '@/api/category/category.service';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CategoryMiddleware implements NestMiddleware {
  constructor(
    private readonly i18n: I18nService,
    private readonly categoryService: CategoryService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = <User>req.user;
    const id = req.params.id;

    const category = await this.categoryService.find({
      userId: user._id!,
      _id: new ObjectId(id),
    });

    if (!category) {
      throw new NotFoundException({
        message: this.i18n.t('custom.category.not_found'),
      });
    }

    req['category'] = category;

    next();
  }
}
