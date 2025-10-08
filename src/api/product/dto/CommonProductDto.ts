import { IsBoolean, IsNotEmpty, MaxLength, MinLength } from 'class-validator';
import { ObjectId } from 'mongodb';

export default class CommonProductDto {
  @MaxLength(63)
  @MinLength(3)
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  categoryId: ObjectId;

  @IsBoolean()
  active: boolean;
}
