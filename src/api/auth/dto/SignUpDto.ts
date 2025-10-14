import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export default class SignUpDto {
  @MaxLength(31, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @MinLength(3, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  name: string;

  @MaxLength(31, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @MinLength(3, {
    message: i18nValidationMessage('validation.minLength'),
  })
  @IsString({
    message: i18nValidationMessage('validation.isString'),
  })
  surname: string;

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

  @MaxLength(127, {
    message: i18nValidationMessage('validation.maxLength'),
  })
  @IsEmail(
    {},
    {
      message: i18nValidationMessage('validation.isEmail'),
    },
  )
  email: string;
}
