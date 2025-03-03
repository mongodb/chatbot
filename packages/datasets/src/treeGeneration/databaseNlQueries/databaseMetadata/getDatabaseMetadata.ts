import {
  Db,
  Document,
  IndexDescription,
  MongoClient,
} from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { getSimplifiedSchema } from "mongodb-schema";
import { strict as assert } from "assert";
import { extractDeterministicSampleOfDocuments } from "./extractDeterministicSampleOfDocuments";

export interface GetDatabaseMetadataParams {
  mongoClient: MongoClient;

  /**
      Name of the MongoDB database to use in queries.
      Currently, only one database is supported.
     */
  databaseName: string;
  numSamplesPerCollection: number;
  latestDate?: Date;
}

export interface CollectionInfo {
  /**
    Name of collection to use in queries.
   */
  collectionName: string;

  description?: string;

  /**
    Information on indexes to apply to the collection.
    If you include the indexes, the system prompt will list
    the indexes along with the collection.
   */
  indexes?: IndexDescription[];
  /**
    Example documents to include in the system prompt.
   */
  exampleDocuments: Document[];

  /**
    Collection schema in JSON format.
   */
  schema: Record<string, unknown>;
}

export interface DatabaseMetadata {
  databaseName: string;
  latestDate?: Date;
  description?: string;
  collections: CollectionInfo[];
}

export async function getDatabaseMetadata({
  mongoClient,
  databaseName,
  numSamplesPerCollection,
  latestDate,
}: GetDatabaseMetadataParams): Promise<DatabaseMetadata> {
  const db = mongoClient.db(databaseName);
  const collections = await db.listCollections().toArray();

  const collectionsMetadata = [];

  for (const collection of collections) {
    const collectionMetadata = await getCollectionMetadata(
      db,
      collection.name,
      numSamplesPerCollection
    );
    collectionsMetadata.push(collectionMetadata);
  }

  return {
    databaseName,
    collections: collectionsMetadata,
    latestDate,
  };
}

async function getCollectionMetadata(
  db: Db,
  collectionName: string,
  sampleDocumentLimit: number
): Promise<CollectionInfo> {
  const collection = db.collection(collectionName);

  const indexes = (await collection
    .listIndexes()
    .toArray()) as unknown as IndexDescription[];
  const exampleDocuments = await extractDeterministicSampleOfDocuments({
    collection,
    limit: sampleDocumentLimit,
  });

  const schema = await getSimplifiedSchema(exampleDocuments);

  return {
    schema,
    indexes,
    collectionName,
    exampleDocuments,
  };
}
