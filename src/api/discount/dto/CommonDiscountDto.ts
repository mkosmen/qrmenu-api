import { IsEnumX } from '@/common/decorators/IsEnumX.validator';
import { DiscountEnum } from '@/lib/types';
import {
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { i18nValidationMessage } from 'nestjs-i18n';

export default class CommonDiscountDto {
  @IsOptional()
  @MaxLength(31)
  @MinLength(1)
  @IsString({
    // message: 'validation.isString',
    message: i18nValidationMessage('validation.isString'),
  })
  code: string;

  @IsOptional()
  @Max(100)
  @Min(0)
  @IsNumber()
  percentage: number;

  @IsOptional()
  @Min(0)
  @IsNumber()
  price: number;

  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
  @IsNumber()
  min_basket_price: number;

  @IsEnumX(DiscountEnum)
  @IsNotEmpty()
  discount_type: string;

  @IsOptional()
  @IsString()
  material_id: ObjectId;

  @IsOptional()
  @IsDate()
  started_at: Date;

  @IsOptional()
  @IsDate()
  finished_at: Date;

  @IsOptional()
  @IsBoolean()
  active: boolean;
}
