import { MongoClient, Db } from "mongodb";

/**
 OSS_TODO: my intuition here (and something we've discussed) is that this abstraction can be removed
 b/c it's such a thin wrapper around the MongoDB client. rather than passing this,
 we can just pass a DB and vector search instance to where we are using this.
 then close the connection at the application level
 */
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
