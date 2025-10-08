import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class CommonCompanyDto {
  @MaxLength(63)
  @MinLength(5)
  @IsNotEmpty()
  name: string;
}
