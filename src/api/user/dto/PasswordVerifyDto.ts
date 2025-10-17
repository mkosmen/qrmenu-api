import { IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export default class PasswordVerifyDto {
  @MaxLength(31, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @MinLength(3, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  password: string;
}
