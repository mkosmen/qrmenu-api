import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  NotFoundException,
  Post,
  Req,
} from '@nestjs/common';
import { User } from '@/lib/types';
import { ProductService } from './product.service';
import { CategoryService } from '@/api/category/category.service';
import CreateProductDto from './dto/CreateProductDto';
import { slugger } from '@/lib/utils';
import { I18nService } from 'nestjs-i18n';
import { MAX_PRODUCT_COUNT } from '@/lib/constant';
import { ObjectId } from 'mongodb';

@Controller('product')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly categoryService: CategoryService,
    private readonly i18n: I18nService,
  ) {}

  async checkProductCount({ user }: { user: User }) {
    const totalProductCount = await this.productService.getOwnCount(user._id!);
    if (totalProductCount >= MAX_PRODUCT_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('custom.exceptions.max_count', {
          args: {
            prop: this.i18n.t('custom.category'),
            count: MAX_PRODUCT_COUNT,
          },
        }),
      });
    }
  }

  async checkCategoryExists(props: { _id: ObjectId; userId: ObjectId }) {
    const result = await this.categoryService.find(props);

    if (!result) {
      throw new NotFoundException({
        message: this.i18n.t('custom.exceptions.not_found', {
          args: { prop: this.i18n.t('custom.category') },
        }),
      });
    }
  }

  async checkAnyProductHasSlug(props: { slug: string; user: User }) {
    const hasAny = await this.productService.hasAny({
      slug: props.slug,
      userId: props.user._id!,
    });

    if (hasAny) {
      throw new ConflictException({
        message: this.i18n.t('custom.exceptions.exists', {
          args: { prop: this.i18n.t('custom.product') },
        }),
      });
    }
  }

  @Post()
  async create(@Body() dto: CreateProductDto, @Req() req: Request) {
    const user = <User>req.user;

    await this.checkProductCount({ user });
    await this.checkCategoryExists({
      _id: new ObjectId(dto.categoryId),
      userId: user._id!,
    });

    const slug = slugger(dto.name);
    await this.checkAnyProductHasSlug({ user, slug });

    const result = await this.productService.create({
      ...dto,
      categoryId: new ObjectId(dto.categoryId),
      active: Boolean(dto.active),
      userId: user._id!,
      slug,
    });

    return result.insertedId;
  }
}
