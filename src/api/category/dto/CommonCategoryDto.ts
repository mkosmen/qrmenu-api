import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export default class CommonCategoryDto {
  @MaxLength(63, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @MinLength(3, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @IsString({
    message: 'validation.isString',
  })
  @IsNotEmpty({
    message: 'validation.isNotEmpty',
  })
  name: string;

  @IsOptional()
  @IsBoolean({ message: i18nValidationMessage('validation.isBoolean') })
  active?: boolean;
}
