import { Db, ObjectId } from 'mongodb';
import { COLLECTIONS, MONGODB_PROVIDER, PAGINATION } from '@/lib/constant';
import { Inject, Injectable } from '@nestjs/common';
import { Category } from '@/lib/types';

@Injectable()
export class CategoryService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async create(category: Category) {
    return await this.db
      .collection<Category>(COLLECTIONS.CATEGORIES)
      .insertOne(category);
  }

  async hasAny({ slug, userId }: { slug: string; userId: ObjectId }) {
    const result = await this.db
      .collection<Category>(COLLECTIONS.CATEGORIES)
      .countDocuments({ slug, userId }, { limit: 1 });

    return result > 0;
  }

  async getOwnCount(userId: ObjectId) {
    return await this.db
      .collection<Category>(COLLECTIONS.CATEGORIES)
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
      .collection<Category[]>(COLLECTIONS.CATEGORIES)
      .find(
        { userId },
        {
          limit,
          skip: (page - 1) * limit,
        },
      )
      .toArray();
  }

  async find(props: { userId: ObjectId; _id: ObjectId }) {
    return await this.db
      .collection<Category>(COLLECTIONS.CATEGORIES)
      .findOne(props);
  }

  async remove(_id: ObjectId) {
    return await this.db
      .collection<Category>(COLLECTIONS.CATEGORIES)
      .deleteOne({ _id });
  }

  async update(_id: ObjectId, category: any) {
    return await this.db.collection<any>(COLLECTIONS.CATEGORIES).updateOne(
      {
        _id,
      },
      {
        $set: category,
      },
    );
  }

  async totalCount(userId: ObjectId) {
    return await this.db
      .collection<Category>(COLLECTIONS.CATEGORIES)
      .countDocuments({ userId });
  }
}
