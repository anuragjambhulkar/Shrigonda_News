import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URL || 'mongodb+srv://rameshbhos96_db_user:Ql5bfboTnVvQwwP1@cluster0.mirjol4.mongodb.net/shrigonda_news';
const dbName = process.env.DB_NAME || 'shrigonda_news';

let cachedClient = null;
let cachedDb = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = await MongoClient.connect(uri, {
    maxPoolSize: 10,
    minPoolSize: 2,
  });

  const db = client.db(dbName);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getCollection(collectionName) {
  const { db } = await connectToDatabase();
  return db.collection(collectionName);
}