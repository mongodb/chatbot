import { MongoClient, Db } from "mongodb";

// TODO: Remove MongoDB implementation and replace uses of it with the "Store" pattern (see EmbeddedContentStore)
interface MongoDBInterface {
  mongoClient: MongoClient;
  db: Db;
  vectorSearchIndexName?: string;
  close: () => Promise<void>;
}
export class MongoDB implements MongoDBInterface {
  mongoClient: MongoClient;
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
