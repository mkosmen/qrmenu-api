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
  @MaxLength(31, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @MinLength(1, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @IsString({
    message: 'validation.isString',
  })
  code: string;

  @IsOptional()
  @Max(100, {
    message: i18nValidationMessage('validation.max'),
  })
  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
  @IsNumber()
  percentage: number;

  @IsOptional()
  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
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
  @IsString({
    message: 'validation.isString',
  })
  material_id: ObjectId;

  @IsOptional()
  @IsDate({
    message: 'validation.isDate',
  })
  started_at: Date;

  @IsOptional()
  @IsDate({
    message: 'validation.isDate',
  })
  finished_at: Date;

  @IsOptional()
  active: boolean;
}
