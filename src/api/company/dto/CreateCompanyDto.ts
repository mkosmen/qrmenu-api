import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class CreateCompanyDto {
  @MaxLength(63)
  @MinLength(5)
  @IsNotEmpty()
  name: string;
}
