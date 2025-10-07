import { Controller, HttpStatus, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { CompanyService } from './company.service';
import CreateCompanyDto from './dto/CreateCompanyDto';
import { User } from '@/lib/types';
import { slugger } from '@/lib/utils';
import { I18n, I18nContext } from 'nestjs-i18n';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const dto = <CreateCompanyDto>req.body;
    const user = <User>req.user;

    const slug = slugger(dto.name);
    const hasAny = await this.companyService.hasAny({
      slug,
      userId: user._id!,
    });

    if (hasAny) {
      res.status(HttpStatus.CONFLICT).send({
        message: i18n.t('custom.company.exists'),
      });

      return;
    }

    const result = await this.companyService.create({
      ...dto,
      userId: user._id!,
      slug,
    });

    return {
      id: result.insertedId.toString(),
    };
  }
}
