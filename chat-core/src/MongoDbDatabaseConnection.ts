import { DatabaseConnection } from "./DatabaseConnection";
import { Page } from "./Page";
import { MongoClient, Db } from "mongodb";

export interface MakeMongoDbDatabaseConnectionParams {
  connectionUri: string;
  databaseName: string;
}

/**
  Constructs connection to MongoDB database.
 */
export function makeMongoDbDatabaseConnection({
  connectionUri,
  databaseName,
}: MakeMongoDbDatabaseConnectionParams): DatabaseConnection & {
  mongoClient: MongoClient;
  db: Db;
} {
  const mongoClient = new MongoClient(connectionUri, {
    serverSelectionTimeoutMS: 30000,
  });
  const db = mongoClient.db(databaseName);
  return {
    mongoClient,
    db,
    async drop() {
      await db.dropDatabase();
    },

    async close(force) {
      mongoClient.close(force);
    },
  };
}

/**
  Returns a query filter that represents a unique page in the system.
 */
export const pageIdentity = ({ url, sourceName }: Page) => ({
  url,
  sourceName,
});
