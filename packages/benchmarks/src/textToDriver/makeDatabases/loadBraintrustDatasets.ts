import { initDataset } from "braintrust";
import { EJSON } from "bson";
import {
  CollationOptions,
  CreateIndexesOptions,
  Document,
  IndexDirection,
  IndexSpecification,
} from "mongodb-rag-core";

interface LoadBraintrustDatasetParams {
  apiKey: string;
  projectName: string;
  datasetName?: string;
}

export async function loadBraintrustMetadata({
  apiKey,
  projectName,
  datasetName = "database-metadata",
}: LoadBraintrustDatasetParams) {
  const dataset = initDataset(projectName, {
    apiKey,
    dataset: datasetName,
  });
  const metadata: DatabaseMetadata[] =
    // TODO: why do i have to cast this as unknown?
    (
      (await dataset.fetchedData()) as unknown as DatabaseMetadataDatasetEntry[]
    ).map(
      (m) =>
        ({
          databaseName: m.input.databaseName,
          collections: m.input.collections.map((c) => ({
            collectionName: c.collectionName,
            indexes: c.indexes.map((idx) =>
              EJSON.deserialize(idx)
            ) as unknown as CollectionMetadata["indexes"],
          })),
        } satisfies DatabaseMetadata)
    );
  return metadata;
}

export interface DatabaseMetadataDatasetEntry {
  input: {
    dataset: string;
    databaseName: string;
    collections: {
      collectionName: string;
      indexes: Record<string, unknown>[];
    }[];
  };
}

export interface DatabaseMetadata {
  databaseName: string;
  collections: CollectionMetadata[];
}

export interface CollectionMetadata {
  collectionName: string;
  indexes: {
    v: CreateIndexesOptions["version"];
    key: Map<string, IndexDirection>;
    name: CreateIndexesOptions["name"];
    // collation?: CollationOptions;
  }[];
}

export async function loadBraintrustDbDocuments({
  apiKey,
  projectName,
  datasetName = "database-documents",
}: LoadBraintrustDatasetParams) {
  const dataset = initDataset(projectName, {
    apiKey,
    dataset: datasetName,
  });
  const dbDocuments: DbDocument[] =
    // TODO: why do i have to cast this as unknown?
    ((await dataset.fetchedData()) as unknown as DbDocumentDatasetRecord[]).map(
      ({ input }) => {
        return {
          databaseName: input.databaseName,
          collectionName: input.collectionName,
          document: EJSON.deserialize(input.ejson) as unknown as Document,
        } satisfies DbDocument;
      }
    );

  return dbDocuments;
}

export interface DbDocumentDatasetRecord {
  input: {
    databaseName: string;
    collectionName: string;
    datasetName: string;
    ejson: Record<string, unknown>;
  };
}

export interface DbDocument {
  databaseName: string;
  collectionName: string;
  document: Document;
}
