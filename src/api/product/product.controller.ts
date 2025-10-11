import type { Request } from 'express';
import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { Product, User } from '@/lib/types';
import { ProductService } from './product.service';
import { CategoryService } from '@/api/category/category.service';
import CreateProductDto from './dto/CreateProductDto';
import { getPagination, slugger } from '@/lib/utils';
import { I18nService } from 'nestjs-i18n';
import { MAX_PRODUCT_COUNT } from '@/lib/constant';
import { ObjectId } from 'mongodb';
import UpdateProductDto from './dto/UpdateProductDto';

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

  async checkAnyProductHasSlug(props: {
    slug: string;
    user: User;
    exceptId?: ObjectId;
  }) {
    const hasAny = await this.productService.hasAny({
      slug: props.slug,
      userId: props.user._id!,
      exceptId: props.exceptId,
    });

    if (hasAny) {
      throw new ConflictException({
        message: this.i18n.t('custom.exceptions.exists', {
          args: { prop: this.i18n.t('custom.product') },
        }),
      });
    }
  }

  getCategoryIdAsObjectId(categoryId: any) {
    try {
      return new ObjectId(String(categoryId));
    } catch {
      throw new NotFoundException({
        message: this.i18n.t('custom.exceptions.not_found', {
          args: { prop: this.i18n.t('custom.category') },
        }),
      });
    }
  }

  @Post()
  async create(@Body() dto: CreateProductDto, @Req() req: Request) {
    const user = <User>req.user;

    await this.checkProductCount({ user });

    const categoryId = this.getCategoryIdAsObjectId(dto.categoryId);
    await this.checkCategoryExists({
      _id: categoryId,
      userId: user._id!,
    });

    const slug = slugger(dto.name);
    await this.checkAnyProductHasSlug({ user, slug });

    const result = await this.productService.create({
      ...dto,
      categoryId,
      active: Boolean(dto.active),
      userId: user._id!,
      slug,
    });

    return result.insertedId;
  }

  @Get('all')
  async findAll(
    @Req() req: Request,
    @Query() query: { page?: number; limit?: number },
  ) {
    console.log('GELDİM');
    const user = <User>req.user;

    const total = await this.productService.totalCount(user._id!);
    const { maxPage, ...pagination } = getPagination({ ...query, total });

    const products = await this.productService.findAll({
      userId: user._id!,
      ...pagination,
    });

    return {
      products,
      pagination: {
        ...pagination,
        total,
        maxPage,
      },
    };
  }

  @Get(':id')
  findOne(@Req() req: Request) {
    return <Product>req['product'];
  }

  @Put(':id')
  async update(@Req() req: Request) {
    const dto = <UpdateProductDto>req.body;
    const user = <User>req.user;
    const product = <Product>req['product'];

    const categoryId = this.getCategoryIdAsObjectId(dto.categoryId);

    await this.checkCategoryExists({
      _id: categoryId,
      userId: user._id!,
    });

    const slug = slugger(dto.name);
    await this.checkAnyProductHasSlug({ slug, user, exceptId: product._id! });

    const { acknowledged } = await this.productService.update(product._id!, {
      ...dto,
      categoryId,
      active: Boolean(dto.active),
      slug,
    });

    return acknowledged;
  }

  @Delete(':id')
  async remove(@Req() req: Request) {
    const product = <Product>req['product'];

    const { acknowledged } = await this.productService.remove(product._id!);

    return acknowledged;
  }

  @Patch(':id/status')
  async setStatus(@Req() req: Request) {
    const dto = <{ active: boolean }>req.body;
    const product = <Product>req['product'];

    const { acknowledged } = await this.productService.update(product._id!, {
      active: Boolean(dto.active),
    });

    return acknowledged;
  }
}
