import SignUpDto from '@/dto/SignUpDto';
import { User } from '@/lib/types';
import { Inject, Injectable } from '@nestjs/common';
import { MONGODB_PROVIDER } from '@/lib/constant';
import { Db } from 'mongodb';

@Injectable()
export class UsersService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async getByEmail(email: string): Promise<User | null> {
    return await this.db.collection<User>('users').findOne({ email });
  }

  async add(userDto: SignUpDto): Promise<boolean> {
    try {
      const { acknowledged } = await this.db
        .collection<User>('users')
        .insertOne(userDto);

      return acknowledged;
    } catch {
      return false;
    }
  }
}
