import { MongoClient, Db } from "mongodb";

export class MongoDB {
  private mongoClient: MongoClient;
  db: Db;
  constructor(connectionUri: string, databaseName: string) {
    this.mongoClient = new MongoClient(connectionUri);
    this.db = this.mongoClient.db(databaseName);
  }
  async close() {
    await this.mongoClient.close();
  }
}

const { MONGODB_CONNECTION_URI, MONGODB_DATABASE_NAME } = process.env;
export const mongodb = new MongoDB(
  MONGODB_CONNECTION_URI!,
  MONGODB_DATABASE_NAME!
);
