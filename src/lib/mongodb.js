import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "bangladesh_tourism";

if (!uri) {
  throw new Error("Please add MONGODB_URI to your .env.local file");
}

const options = {};

const globalForMongo = globalThis;

export async function connectDB() {
  if (!globalForMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);

    globalForMongo._mongoClientPromise = client.connect();
  }

  const client = await globalForMongo._mongoClientPromise;

  return client.db(dbName);
}