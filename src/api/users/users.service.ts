import SignUpDto from '@/dto/SignUpDto';
import { getDb } from '@/lib/mongo/client';
import { User } from '@/lib/types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  async getByEmail(email: string): Promise<User | null> {
    return await getDb().collection<User>('users').findOne({ email });
  }

  async add(userDto: SignUpDto): Promise<boolean> {
    try {
      const { acknowledged } = await getDb()
        .collection<User>('users')
        .insertOne(userDto);

      return acknowledged;
    } catch {
      return false;
    }
  }
}
