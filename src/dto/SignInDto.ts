import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class SignInDto {
  @IsEmail()
  email: string;

  @MaxLength(31)
  @MinLength(3)
  @IsNotEmpty()
  password: string;
}
