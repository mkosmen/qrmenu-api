import { Db, ObjectId } from 'mongodb';
import { COLLECTIONS, MONGODB_PROVIDER } from '@/lib/constant';
import { Inject, Injectable } from '@nestjs/common';
import { Discount } from '@/lib/types';

@Injectable()
export class DiscountService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async create(discount: Discount) {
    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .insertOne(discount);
  }

  async find(props: { userId: ObjectId; _id: ObjectId }) {
    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .findOne(props);
  }

  async getOwnCount(userId: ObjectId) {
    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .countDocuments({ userId });
  }

  async getActiveCount(userId: ObjectId) {
    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .countDocuments({ userId, active: true });
  }
}
