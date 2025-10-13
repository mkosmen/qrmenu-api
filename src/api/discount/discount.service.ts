import { Db, ObjectId } from 'mongodb';
import { COLLECTIONS, MONGODB_PROVIDER, PAGINATION } from '@/lib/constant';
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

  async getActiveCount(props: { userId: ObjectId; exceptId?: ObjectId }) {
    const filter = { userId: props.userId, active: true };
    if (props?.exceptId) {
      filter['_id'] = { $ne: props.exceptId };
    }

    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .countDocuments(filter);
  }

  async checkByCode(props: {
    userId: ObjectId;
    code: string;
    exceptId?: ObjectId;
  }) {
    const { exceptId, ...filter } = props;
    if (exceptId) {
      filter['_id'] = { $ne: exceptId };
    }

    const result = await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .countDocuments(filter, { limit: 1 });

    return result > 0;
  }

  async totalCount(userId: ObjectId) {
    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .countDocuments({ userId });
  }

  async findAll({
    userId,
    page = PAGINATION.PAGE,
    limit = PAGINATION.LIMIT,
  }: {
    userId: ObjectId;
    page: number;
    limit: number;
  }) {
    return await this.db
      .collection<Discount[]>(COLLECTIONS.DISCOUNTS)
      .find(
        { userId },
        {
          limit,
          skip: (page - 1) * limit,
        },
      )
      .toArray();
  }

  async update(_id: ObjectId, discount: any) {
    return await this.db.collection(COLLECTIONS.DISCOUNTS).updateOne(
      {
        _id,
      },
      {
        $set: discount,
      },
    );
  }

  async remove(_id: ObjectId) {
    return await this.db
      .collection<Discount>(COLLECTIONS.DISCOUNTS)
      .deleteOne({ _id });
  }
}
