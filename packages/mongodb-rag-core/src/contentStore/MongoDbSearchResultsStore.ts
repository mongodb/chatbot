import { DatabaseConnection } from "../DatabaseConnection";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "../MongoDbDatabaseConnection";
import { Document } from "mongodb";

export interface SearchResultRecord {
  query: string;
  results: Document[];
  dataSources?: string[];
  limit?: number;
  createdAt: Date;
}

export type SearchResultsStore = DatabaseConnection & {
  saveSearchResult(record: SearchResultRecord): Promise<void>;
  // Add more methods as needed
  metadata: {
    databaseName: string;
    collectionName: string;
  };
  init(): Promise<void>;
};

export type MakeMongoDbSearchResultsStoreParams = MakeMongoDbDatabaseConnectionParams & {
  collectionName?: string;
};

export function makeMongoDbSearchResultsStore({
  connectionUri,
  databaseName,
  collectionName = "searchResults",
}: MakeMongoDbSearchResultsStoreParams): SearchResultsStore {
  const { db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const searchResultsCollection = db.collection<SearchResultRecord>(collectionName);
  return {
    drop,
    close,
    metadata: {
      databaseName,
      collectionName,
    },
    async saveSearchResult(record) {
      // TODO: implement in EAI-973
    },
    async init() {
      await searchResultsCollection.createIndex({ query: 1 });
      await searchResultsCollection.createIndex({ createdAt: -1 });
    },
  };
}