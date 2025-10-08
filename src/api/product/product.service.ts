import { Inject, Injectable } from '@nestjs/common';
import { Db, ObjectId } from 'mongodb';
import { MONGODB_PROVIDER, COLLECTIONS } from '@/lib/constant';
import { Product } from '@/lib/types';

@Injectable()
export class ProductService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async hasAny({ slug, userId }: { slug: string; userId: ObjectId }) {
    const result = await this.db
      .collection(COLLECTIONS.PRODUCTS)
      .countDocuments({ slug, userId }, { limit: 1 });

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
}
