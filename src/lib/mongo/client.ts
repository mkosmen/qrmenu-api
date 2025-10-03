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
    console.error('db connection failed');
    await client.close();
  }
}

export const getDb = () => db;
