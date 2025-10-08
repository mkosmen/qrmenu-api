import { IsBoolean, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export default class CommonCategoryDto {
  @MaxLength(63)
  @MinLength(5)
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  active: boolean;
}
