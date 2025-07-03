import { z } from "zod";
import { DatabaseConnection } from "../DatabaseConnection";
import {
  MakeMongoDbDatabaseConnectionParams,
  makeMongoDbDatabaseConnection,
} from "../MongoDbDatabaseConnection";
import { Document } from "mongodb";

export const SearchRecordDataSourceSchema = z.object({
  name: z.string(),
  type: z.string().optional(),
  versionLabel: z.string().optional(),
});

export type SearchRecordDataSource = z.infer<
  typeof SearchRecordDataSourceSchema
>;

export interface ResultChunk {
  url: string;
  title: string;
  text: string;
  metadata: {
    sourceName: string;
    sourceType?: string;
    tags?: string[];
    [key: string]: any; // Accept additional unknown properties
  };
}

export const ResultChunkSchema = z.object({
  url: z.string(),
  title: z.string(),
  text: z.string(),
  metadata: z.object({
    sourceName: z.string(),
    sourceType: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }).passthrough(),
});

export const SearchResultRecordSchema = z.object({
  query: z.string(),
  results: z.array(ResultChunkSchema),
  dataSources: z.array(SearchRecordDataSourceSchema).optional(),
  limit: z.number().optional(),
  createdAt: z.date(),
});

export interface SearchResultRecord {
  query: string;
  results: Document[];
  dataSources?: SearchRecordDataSource[];
  limit?: number;
  createdAt: Date;
}

export type MongoDbSearchResultsStore = DatabaseConnection & {
  metadata: {
    databaseName: string;
    collectionName: string;
  };
  saveSearchResult(record: SearchResultRecord): Promise<void>;
  init(): Promise<void>;
};

export type MakeMongoDbSearchResultsStoreParams =
  MakeMongoDbDatabaseConnectionParams & {
    collectionName?: string;
  };

export type ContentCustomData = Record<string, unknown> | undefined;

export function makeMongoDbSearchResultsStore({
  connectionUri,
  databaseName,
  collectionName = "search_results",
}: MakeMongoDbSearchResultsStoreParams): MongoDbSearchResultsStore {
  const { db, drop, close } = makeMongoDbDatabaseConnection({
    connectionUri,
    databaseName,
  });
  const searchResultsCollection =
    db.collection<SearchResultRecord>(collectionName);
  return {
    drop,
    close,
    metadata: {
      databaseName,
      collectionName,
    },
    async saveSearchResult(record: SearchResultRecord) {
      SearchResultRecordSchema.parse(record);
      const insertResult = await searchResultsCollection.insertOne(record);

      if (!insertResult.acknowledged) {
        throw new Error("Insert was not acknowledged by MongoDB");
      }
      if (!insertResult.insertedId) {
        throw new Error(
          "No insertedId returned from MongoDbSearchResultsStore.saveSearchResult insertOne"
        );
      }
    },
    async init() {
      await searchResultsCollection.createIndex({ createdAt: -1 });
    },
  };
}
