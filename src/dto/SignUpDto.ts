import { IsEmail, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class SignUpDto {
  @MaxLength(31)
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @MaxLength(31)
  @MinLength(3)
  @IsNotEmpty()
  surname: string;

  @MaxLength(31)
  @MinLength(3)
  @IsNotEmpty()
  password: string;

  @IsEmail()
  email: string;
}
