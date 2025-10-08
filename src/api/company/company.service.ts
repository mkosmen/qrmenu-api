import { Db, ObjectId } from 'mongodb';
import { COLLECTIONS, MONGODB_PROVIDER } from '@/lib/constant';
import { Inject, Injectable } from '@nestjs/common';
import { Company } from '@/lib/types';

@Injectable()
export class CompanyService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async create(company: Company) {
    return await this.db
      .collection<Company>(COLLECTIONS.COMPANIES)
      .insertOne(company);
  }

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
      .collection<Company>(COLLECTIONS.COMPANIES)
      .countDocuments(filter, { limit: 1 });

    return result > 0;
  }

  async getOwnCount(userId: ObjectId) {
    return await this.db
      .collection<Company>(COLLECTIONS.COMPANIES)
      .countDocuments({ userId });
  }

  async findAll(userId: ObjectId) {
    return await this.db
      .collection<Company[]>(COLLECTIONS.COMPANIES)
      .find({ userId })
      .toArray();
  }

  async find(props: { userId: ObjectId; _id: ObjectId }) {
    return await this.db
      .collection<Company>(COLLECTIONS.COMPANIES)
      .findOne(props);
  }

  async remove(props: { userId: ObjectId; _id: ObjectId }) {
    return await this.db
      .collection<Company>(COLLECTIONS.COMPANIES)
      .deleteOne(props);
  }

  async update(_id: ObjectId, company: Company) {
    return await this.db.collection<Company>(COLLECTIONS.COMPANIES).updateOne(
      {
        _id,
      },
      {
        $set: company,
      },
    );
  }
}
