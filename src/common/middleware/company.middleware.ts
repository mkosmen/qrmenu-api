import { Request, Response, NextFunction } from 'express';
import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { CompanyService } from '@/api/company/company.service';
import { User } from '@/lib/types';
import { ObjectId } from 'mongodb';
import { I18nService } from 'nestjs-i18n';

@Injectable()
export class CompanyMiddleware implements NestMiddleware {
  constructor(
    private readonly i18n: I18nService,
    private readonly companyService: CompanyService,
  ) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const user = <User>req.user;
    const id = req.params.id;

    const company = await this.companyService.find({
      userId: user._id!,
      _id: new ObjectId(id),
    });

    if (!company) {
      throw new NotFoundException({
        message: this.i18n.t('custom.company.not_found'),
      });
    }

    req['company'] = company;

    next();
  }
}
