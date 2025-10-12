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
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { Request } from 'express';
import { Category, User } from '@/lib/types';
import { MAX_CATEGORY_COUNT } from '@/lib/constant';
import { getPagination, slugger } from '@/lib/utils';
import { CategoryService } from './category.service';
import CreateCategoryDto from './dto/CreateCategoryDto';
import UpdateCategoryDto from './dto/UpdateCategoryDto';

@Controller('category')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly i18n: I18nService,
  ) {}

  async checkCategoryCount(props: { user: User }) {
    const totalCategoryCount = await this.categoryService.getOwnCount(
      props.user._id!,
    );
    if (totalCategoryCount >= MAX_CATEGORY_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('custom.exception.max_count', {
          args: {
            prop: this.i18n.t('custom.category'),
            count: MAX_CATEGORY_COUNT,
          },
        }),
      });
    }
  }

  async checkAnyCategoryHasSlug(props: { slug: string; user: User }) {
    const hasAny = await this.categoryService.hasAny({
      slug: props.slug,
      userId: props.user._id!,
    });

    if (hasAny) {
      throw new ConflictException({
        message: this.i18n.t('custom.exception.exists', {
          args: {
            prop: this.i18n.t('custom.category'),
          },
        }),
      });
    }
  }

  @Post()
  async create(@Req() req: Request) {
    const dto = <CreateCategoryDto>req.body;
    const user = <User>req.user;

    await this.checkCategoryCount({ user });

    const slug = slugger(dto.name);
    await this.checkAnyCategoryHasSlug({ slug, user });

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
  async update(@Req() req: Request) {
    const dto = <UpdateCategoryDto>req.body;
    const user = <User>req.user;
    const category = <Category>req['category'];

    const slug = slugger(dto.name);
    await this.checkAnyCategoryHasSlug({ slug, user });

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
