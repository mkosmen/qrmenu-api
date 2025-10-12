import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { CompanyService } from './company.service';
import CreateCompanyDto from './dto/CreateCompanyDto';
import { Company, User } from '@/lib/types';
import { slugger } from '@/lib/utils';
import { I18nService } from 'nestjs-i18n';
import { MAX_COMPANY_COUNT } from '@/lib/constant';
import UpdateCompanyDto from './dto/UpdateCompanyDto';
import { ObjectId } from 'mongodb';

@Controller('company')
export class CompanyController {
  constructor(
    private readonly companyService: CompanyService,
    private readonly i18n: I18nService,
  ) {}

  async checkCompanyCount(props: { user: User }) {
    const totalCompanyCount = await this.companyService.getOwnCount(
      props.user._id!,
    );
    if (totalCompanyCount >= MAX_COMPANY_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('custom.company.maxCount', {
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
    exceptId?: ObjectId;
  }) {
    const hasAny = await this.companyService.hasAny({
      slug: props.slug,
      userId: props.user._id!,
      exceptId: props.exceptId,
    });

    if (hasAny) {
      throw new ConflictException({
        message: this.i18n.t('custom.company.exists'),
      });
    }
  }

  @Post()
  async create(@Req() req: Request, @Body() dto: CreateCompanyDto) {
    const user = <User>req.user;

    await this.checkCompanyCount({ user });

    const slug = slugger(dto.name);
    await this.checkAnyCompanyHasSlug({ slug, user });

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
  async update(@Req() req: Request, @Body() dto: UpdateCompanyDto) {
    const user = <User>req.user;
    const company = <Company>req['company'];

    const slug = slugger(dto.name);
    await this.checkAnyCompanyHasSlug({ slug, user, exceptId: company._id });

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
