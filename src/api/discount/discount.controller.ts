import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { I18nService } from 'nestjs-i18n';
import { MAX_DISCOUNT_COUNT, MAX_ACTIVE_DISCOUNT_COUNT } from '@/lib/constant';
import { DiscountEnum, User } from '@/lib/types';
import CreateDiscountDto from './dto/CreateDiscountDto';
import type { Request } from 'express';

@Controller('discount')
export class DiscountController {
  constructor(
    private readonly discountService: DiscountService,
    private readonly i18n: I18nService,
  ) {}

  async checkDiscountCount(props: { user: User }) {
    const totalDiscountCount = await this.discountService.getOwnCount(
      props.user._id!,
    );
    if (totalDiscountCount >= MAX_DISCOUNT_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('custom.exception.max_count', {
          args: {
            prop: this.i18n.t('custom.discount'),
            count: MAX_DISCOUNT_COUNT,
          },
        }),
      });
    }
  }

  async checkActiveDiscountCount(props: { user: User }) {
    const totalActiveDiscountCount = await this.discountService.getActiveCount(
      props.user._id!,
    );

    if (totalActiveDiscountCount >= MAX_ACTIVE_DISCOUNT_COUNT) {
      throw new BadRequestException({
        message: this.i18n.t('custom.exception.max_active_count', {
          args: {
            prop: this.i18n.t('custom.discount'),
            count: MAX_ACTIVE_DISCOUNT_COUNT,
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

    const result = await this.discountService.create({
      ...dto,
      discount_type: <DiscountEnum>dto?.discount_type,
      active: Boolean(dto.active),
      userId: user._id!,
    });

    return {
      id: result.insertedId.toString(),
    };
  }
}
