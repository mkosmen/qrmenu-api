import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import type { Request } from 'express';
import { MAX_DISCOUNT_COUNT, MAX_ACTIVE_DISCOUNT_COUNT } from '@/lib/constant';
import { Discount, DiscountEnum, User } from '@/lib/types';
import { DiscountService } from './discount.service';
import CreateDiscountDto from './dto/CreateDiscountDto';
import { ProductService } from '../product/product.service';
import { ObjectId } from 'mongodb';
import { getPagination } from '@/lib/utils';
import UpdateDiscountDto from './dto/UpdateDiscountDto';

@Controller('discount')
export class DiscountController {
  constructor(
    private readonly discountService: DiscountService,
    private readonly productService: ProductService,
    private readonly i18n: I18nService,
  ) {}

  async checkDiscountCount(props: { user: User }) {
    const totalDiscountCount = await this.discountService.getOwnCount(
      props.user._id!,
    );
    if (totalDiscountCount >= MAX_DISCOUNT_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('exceptions.max_count', {
          args: {
            prop: this.i18n.t('custom.discount'),
            count: MAX_DISCOUNT_COUNT,
          },
        }),
      });
    }
  }

  async checkActiveDiscountCount(props: { user: User; exceptId?: ObjectId }) {
    const totalActiveDiscountCount = await this.discountService.getActiveCount({
      userId: props.user._id!,
      exceptId: props.exceptId,
    });

    if (totalActiveDiscountCount >= MAX_ACTIVE_DISCOUNT_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('exceptions.max_active_count', {
          args: {
            prop: this.i18n.t('custom.discount'),
            count: MAX_ACTIVE_DISCOUNT_COUNT,
          },
        }),
      });
    }
  }

  async checkSameCode(props: {
    user: User;
    code: string;
    exceptId?: ObjectId;
  }) {
    const hasCode = await this.discountService.checkByCode({
      userId: props.user._id!,
      code: props.code,
      exceptId: props.exceptId,
    });

    if (hasCode) {
      throw new BadRequestException({
        message: this.i18n.t('exceptions.exists', {
          args: {
            prop: this.i18n.t('property.discount.code'),
          },
        }),
      });
    }
  }

  async checkProduct(props: { user: User; productId: ObjectId }) {
    const product = await this.productService.find({
      userId: props.user._id!,
      _id: new ObjectId(props.productId),
    });

    if (!product) {
      throw new BadRequestException({
        message: this.i18n.t('exceptions.not_found', {
          args: {
            prop: this.i18n.t('custom.product'),
          },
        }),
      });
    }
  }

  @Post()
  async create(@Body() dto: CreateDiscountDto, @Req() req: Request) {
    const user = <User>req.user;

    await this.checkDiscountCount({ user });
    if (dto?.active) {
      await this.checkActiveDiscountCount({ user });
    }

    if (dto?.code) {
      await this.checkSameCode({ user, code: dto.code });
    }

    if (dto?.type === DiscountEnum.PRODUCT) {
      await this.checkProduct({
        user,
        productId: dto.material_id!,
      });
    } else {
      delete dto?.material_id;
    }

    const result = await this.discountService.create({
      ...dto,
      userId: user._id!,
    });

    return {
      id: result.insertedId.toString(),
    };
  }

  @Get()
  async findAll(
    @Req() req: Request,
    @Query() query: { page?: number; limit?: number },
  ) {
    const user = <User>req.user;

    const total = await this.discountService.totalCount(user._id!);
    const { maxPage, ...pagination } = getPagination({ ...query, total });

    const discounts = await this.discountService.findAll({
      userId: user._id!,
      ...pagination,
    });

    return {
      discounts,
      pagination: {
        ...pagination,
        total,
        maxPage,
      },
    };
  }

  @Get(':id')
  find(@Req() req: Request) {
    return <Discount>req['discount'];
  }

  @Put(':id')
  async update(@Req() req: Request, @Body() dto: UpdateDiscountDto) {
    const user = <User>req.user;
    const discount = <Discount>req['discount'];

    if (dto?.active) {
      await this.checkActiveDiscountCount({ user, exceptId: discount._id });
    }

    if (dto?.code) {
      await this.checkSameCode({
        user,
        code: dto.code,
        exceptId: discount._id,
      });
    }

    if (dto?.type === DiscountEnum.PRODUCT) {
      await this.checkProduct({
        user,
        productId: dto.material_id!,
      });
    } else {
      delete dto?.material_id;
    }

    const acknowledged = await this.discountService.update(discount._id!, dto);

    return acknowledged;
  }

  @Delete(':id')
  async remove(@Req() req: Request) {
    const discount = <Discount>req['discount'];

    const { acknowledged } = await this.discountService.remove(discount._id!);

    return acknowledged;
  }

  @Patch(':id/status')
  async setStatus(@Req() req: Request) {
    const user = <User>req.user;
    const dto = <{ active: boolean }>req.body;
    const discount = <Discount>req['discount'];

    if (dto.active) {
      await this.checkActiveDiscountCount({ user });
    }

    const { acknowledged } = await this.discountService.update(discount._id!, {
      active: dto.active,
    });

    return acknowledged;
  }
}
