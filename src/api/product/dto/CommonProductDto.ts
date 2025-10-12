import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ObjectId } from 'mongodb';
import { i18nValidationMessage } from 'nestjs-i18n';

export default class CommonProductDto {
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

  @IsNotEmpty()
  categoryId: ObjectId;

  @IsBoolean()
  active: boolean;
}
