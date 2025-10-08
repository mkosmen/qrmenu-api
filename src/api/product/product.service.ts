import { Inject, Injectable } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { MONGODB_PROVIDER, COLLECTIONS } from '@/lib/constant';
import { Product } from '@/lib/types';

@Injectable()
export class ProductService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async hasAny({
    slug,
    userId,
    exceptId,
  }: {
    slug: string;
    userId: ObjectId;
    exceptId?: ObjectId;
  }) {
    const filter = { slug, userId };
    if (exceptId) {
      filter['_id'] = { $ne: exceptId };
    }

    const result = await this.db
      .collection(COLLECTIONS.PRODUCTS)
      .countDocuments(filter, { limit: 1 });

    return result > 0;
  }

  async getOwnCount(userId: ObjectId) {
    return await this.db
      .collection(COLLECTIONS.PRODUCTS)
      .countDocuments({ userId });
  }

  async create(product: Product) {
    return await this.db.collection(COLLECTIONS.PRODUCTS).insertOne(product);
  }

  async find(props: { userId: ObjectId; _id: ObjectId }) {
    return await this.db.collection(COLLECTIONS.PRODUCTS).findOne(props);
  }

  async remove(_id: ObjectId) {
    return await this.db.collection(COLLECTIONS.PRODUCTS).deleteOne({ _id });
  }

  async update(_id: ObjectId, product: any) {
    return await this.db.collection<any>(COLLECTIONS.PRODUCTS).updateOne(
      {
        _id,
      },
      {
        $set: product,
      },
    );
  }

  async totalCount(userId: ObjectId) {
    return await this.db
      .collection(COLLECTIONS.PRODUCTS)
      .countDocuments({ userId });
  }
}
