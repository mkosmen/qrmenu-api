import {
  BadRequestException,
  ConflictException,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Req,
  Query,
  Res,
} from '@nestjs/common';
import { I18n, I18nContext } from 'nestjs-i18n';
import type { Request, Response } from 'express';
import { Category, User } from '@/lib/types';
import { MAX_CATEGORY_COUNT } from '@/lib/constant';
import { getPagination, slugger } from '@/lib/utils';
import { CategoryService } from './category.service';
import CreateCategoryDto from './dto/CreateCategoryDto';
import UpdateCategoryDto from './dto/UpdateCategoryDto';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  async checkCategoryCount(props: {
    user: User;
    res: Response;
    i18n: I18nContext;
  }) {
    const totalCategoryCount = await this.categoryService.getOwnCount(
      props.user._id!,
    );
    if (totalCategoryCount >= MAX_CATEGORY_COUNT) {
      throw new BadRequestException({
        message: props.i18n.t('custom.category.maxCount', {
          args: {
            count: MAX_CATEGORY_COUNT,
          },
        }),
      });
    }
  }

  async checkAnyCategoryHasSlug(props: {
    slug: string;
    user: User;
    res: Response;
    i18n: I18nContext;
  }) {
    const hasAny = await this.categoryService.hasAny({
      slug: props.slug,
      userId: props.user._id!,
    });

    if (hasAny) {
      throw new ConflictException({
        message: props.i18n.t('custom.category.exists'),
      });
    }
  }

  @Post()
  async create(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const dto = <CreateCategoryDto>req.body;
    const user = <User>req.user;

    await this.checkCategoryCount({ res, user, i18n });

    const slug = slugger(dto.name);
    await this.checkAnyCategoryHasSlug({ slug, res, user, i18n });

    const result = await this.categoryService.create({
      ...dto,
      active: Boolean(dto.active),
      userId: user._id!,
      slug,
    });

    return {
      id: result.insertedId.toString(),
    };
  }

  @Get('all')
  async findAll(
    @Req() req: Request,
    @Query() query: { page?: number; limit?: number },
  ) {
    const user = <User>req.user;

    const total = await this.categoryService.totalCount(user._id!);
    const { maxPage, ...pagination } = getPagination({ ...query, total });

    const categories = await this.categoryService.findAll({
      userId: user._id!,
      ...pagination,
    });

    return {
      categories,
      pagination: {
        ...pagination,
        total,
        maxPage,
      },
    };
  }

  @Get(':id')
  find(@Req() req: Request) {
    return <Category>req['category'];
  }

  @Patch(':id')
  async update(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
    @I18n() i18n: I18nContext,
  ) {
    const dto = <UpdateCategoryDto>req.body;
    const user = <User>req.user;
    const category = <Category>req['category'];

    const slug = slugger(dto.name);
    await this.checkAnyCategoryHasSlug({ slug, res, user, i18n });

    const { acknowledged } = await this.categoryService.update(category._id!, {
      ...dto,
      active: Boolean(dto.active),
      slug,
    });

    return acknowledged;
  }

  @Delete(':id')
  async remove(@Req() req: Request) {
    const category = <Category>req['category'];

    const { acknowledged } = await this.categoryService.remove(category._id!);

    return acknowledged;
  }

  @Patch(':id/status')
  async setStatus(@Req() req: Request) {
    const dto = <{ active: boolean }>req.body;
    const category = <Category>req['category'];

    const { acknowledged } = await this.categoryService.update(category._id!, {
      active: Boolean(dto.active),
    });

    return acknowledged;
  }
}
