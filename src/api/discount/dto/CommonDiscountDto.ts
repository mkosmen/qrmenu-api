import { IsEnumX } from '@/common/decorators/IsEnumX.validator';
import { DiscountEnum } from '@/lib/types';
import {
  IsBoolean,
  IsDate,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Matches,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { i18nValidationMessage } from 'nestjs-i18n';

export default class CommonDiscountDto {
  @IsOptional()
  @Matches(/^[^\s]+$/)
  @Length(1, 31, {
    message: i18nValidationMessage('validation.length'),
  })
  @IsString({
    message: 'validation.isString',
  })
  code?: string;

  @IsOptional()
  @Max(100, {
    message: i18nValidationMessage('validation.max'),
  })
  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: i18nValidationMessage('validation.isNumber'),
    },
  )
  percentage?: number;

  @IsOptional()
  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: i18nValidationMessage('validation.isNumber'),
    },
  )
  price?: number;

  @IsOptional()
  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
  @IsNumber(
    {
      maxDecimalPlaces: 2,
    },
    {
      message: i18nValidationMessage('validation.isNumber'),
    },
  )
  min_basket_price?: number;

  @IsEnumX(DiscountEnum, { i18nKey: 'discount.types' })
  type: DiscountEnum;

  @IsOptional()
  @ValidateIf((d: CommonDiscountDto) => d.type === DiscountEnum.PRODUCT)
  @IsMongoId({
    message: 'validation.isMongoId',
  })
  material_id?: ObjectId | null;

  @IsOptional()
  @IsDate({
    message: 'validation.isDate',
  })
  started_at?: Date;

  @IsOptional()
  @IsDate({
    message: 'validation.isDate',
  })
  finished_at?: Date;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  active?: boolean;

  @IsOptional()
  @Min(0, {
    message: i18nValidationMessage('validation.min'),
  })
  @IsNumber(
    {},
    {
      message: i18nValidationMessage('validation.isNumber'),
    },
  )
  max_use_count?: number;
}
