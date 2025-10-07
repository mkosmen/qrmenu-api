import { Db, ObjectId } from 'mongodb';
import { MONGODB_PROVIDER } from '@/lib/constant';
import { Inject, Injectable } from '@nestjs/common';
import { Company } from '@/lib/types';

@Injectable()
export class CompanyService {
  constructor(@Inject(MONGODB_PROVIDER) private readonly db: Db) {}

  async create(company: Company) {
    return await this.db.collection<Company>('companies').insertOne(company);
  }

  async hasAny({ slug, userId }: { slug: string; userId: ObjectId }) {
    const result = await this.db
      .collection<Company>('companies')
      .countDocuments({ slug, userId }, { limit: 1 });

    return result > 0;
  }
}
