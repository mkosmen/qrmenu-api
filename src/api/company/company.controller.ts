import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CompanyService } from './company.service';
import CreateCompanyDto from './dto/CreateCompanyDto';
import { Company, User } from '@/lib/types';
import { slugger } from '@/lib/utils';
import { I18n, I18nContext } from 'nestjs-i18n';
import { MAX_COMPANY_COUNT } from '@/lib/constant';
import UpdateCompanyDto from './dto/UpdateCompanyDto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  async checkCompanyCount(props: {
    user: User;
    res: Response;
    i18n: I18nContext;
  }) {
    const totalCompanyCount = await this.companyService.getOwnCount(
      props.user._id!,
    );
    if (totalCompanyCount >= MAX_COMPANY_COUNT) {
      throw new BadRequestException({
        message: props.i18n.t('custom.company.maxCount', {
          args: {
            count: MAX_COMPANY_COUNT,
          },
        }),
      });
    }
  }

  async checkAnyCompanyHasSlug(props: {
    slug: string;
    user: User;
    res: Response;
    i18n: I18nContext;
  }) {
    const hasAny = await this.companyService.hasAny({
      slug: props.slug,
      userId: props.user._id!,
    });

    if (hasAny) {
      throw new ConflictException({
        message: props.i18n.t('custom.company.exists'),
      });
    }
  }

  @Post()
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const dto = <CreateCompanyDto>req.body;
    const user = <User>req.user;

    await this.checkCompanyCount({ res, user, i18n });

    const slug = slugger(dto.name);
    await this.checkAnyCompanyHasSlug({ slug, res, user, i18n });

    const result = await this.companyService.create({
      ...dto,
      userId: user._id!,
      slug,
    });

    return {
      id: result.insertedId.toString(),
    };
  }

  @Get('all')
  async findAll(@Req() req: Request) {
    const user = <User>req.user;

    return await this.companyService.findAll(user._id!);
  }

  @Get(':id')
  find(@Req() req: Request) {
    return <Company>req['company'];
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const dto = <UpdateCompanyDto>req.body;
    const user = <User>req.user;
    const company = <Company>req['company'];

    const slug = slugger(dto.name);
    await this.checkAnyCompanyHasSlug({ slug, res, user, i18n });

    const { acknowledged } = await this.companyService.update(company._id!, {
      ...dto,
      userId: user._id!,
      slug,
    });

    return acknowledged;
  }

  @Delete(':id')
  async remove(@Req() req: Request) {
    const user = <User>req.user;
    const company = <Company>req['company'];

    const { acknowledged } = await this.companyService.remove({
      userId: user._id!,
      _id: company._id!,
    });

    return acknowledged;
  }
}
