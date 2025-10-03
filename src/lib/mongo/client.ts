import { Db, MongoClient, ServerApiVersion } from 'mongodb';
import { HOST, DB } from '../constant';

let db: Db;

const client = new MongoClient(HOST, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function connect() {
  try {
    await client.connect();
    db = client.db(DB);
    await db.command({ ping: 1 });
    console.log('db connection success');
  } catch {
    await client.close();

    throw new Error('Please check your DB connection');
  }
}

export const getDb = () => db;
