import { strict as assert } from "assert";
import { MongoClient } from "mongodb-rag-core/mongodb";

export interface ExtractSampleDocumentsParams {
  mongoClient: MongoClient;
  collectionName: string;
  databaseName: string;
  /**
    Number of documents to include in the sample.
   */
  limit?: number;
}
export const MUST_HAVE_AT_LEAST_ONE_EXAMPLE_DOCUMENT_ERROR =
  "Must have at least one example document";
/**
  Extract deterministic sample of documents for a given collection.
 */
export async function extractDeterministicSampleOfDocuments({
  mongoClient,
  collectionName,
  databaseName,
  limit = 5,
}: ExtractSampleDocumentsParams) {
  await mongoClient.connect();
  const collection = mongoClient.db(databaseName).collection(collectionName);
  const documents = await collection
    .aggregate([
      // Add a hash field to the document
      { $addFields: { hash: { $toHashedIndexKey: "$_id" } } },
      { $sort: { hash: 1 } },
      { $limit: limit },
    ])
    .toArray();
  assert(documents.length > 0, MUST_HAVE_AT_LEAST_ONE_EXAMPLE_DOCUMENT_ERROR);
  return documents;
}
