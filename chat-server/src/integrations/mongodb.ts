import { MongoClient, Db } from "mongodb";

interface MongoDBInterface {
  db: Db;
  vectorSearchIndexName?: string;
  close: () => Promise<void>;
}
export class MongoDB implements MongoDBInterface {
  private mongoClient: MongoClient;
  db: Db;
  vectorSearchIndexName?: string;
  constructor(
    connectionUri: string,
    databaseName: string,
    vectorSearchIndexName?: string
  ) {
    this.mongoClient = new MongoClient(connectionUri);
    this.db = this.mongoClient.db(databaseName);
    this.vectorSearchIndexName = vectorSearchIndexName;
  }
  async close() {
    await this.mongoClient.close();
  }
}

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  VECTOR_SEARCH_INDEX_NAME,
} = process.env;
export const mongodb = new MongoDB(
  MONGODB_CONNECTION_URI!,
  MONGODB_DATABASE_NAME!,
  VECTOR_SEARCH_INDEX_NAME!
);
