import SignUpDto from '@/api/auth/dto/SignUpDto';
import { User } from '@/lib/types';
import { Inject, Injectable } from '@nestjs/common';
import { COLLECTIONS, MONGODB_PROVIDER } from '@/lib/constant';
import { Db } from 'mongodb';

@Injectable()
export class UserService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async getByEmail(email: string): Promise<User | null> {
    return await this.db.collection<User>(COLLECTIONS.USERS).findOne({ email });
  }

  async add(userDto: SignUpDto): Promise<boolean> {
    try {
      const { acknowledged } = await this.db
        .collection<User>(COLLECTIONS.USERS)
        .insertOne(userDto);

      return acknowledged;
    } catch {
      return false;
    }
  }
}
