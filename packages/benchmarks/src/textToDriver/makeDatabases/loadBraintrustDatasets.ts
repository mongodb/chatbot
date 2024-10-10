import { initDataset } from "braintrust";
import { z } from "zod";
import { Document, BSON } from "mongodb-rag-core";

const { EJSON } = BSON;

interface LoadBraintrustDatasetParams {
  apiKey: string;
  projectName: string;
  datasetName?: string;
}

const DatabaseMetadataDatasetEntrySchema = z.object({
  input: z.object({
    dataset: z.string(),
    databaseName: z.string(),
    collections: z.array(
      z.object({
        collectionName: z.string(),
        indexes: z.array(z.record(z.unknown())),
      })
    ),
  }),
});

export type DatabaseMetadataDatasetEntry = z.infer<
  typeof DatabaseMetadataDatasetEntrySchema
>;

const IndexDirectionSchema = z.union([z.literal(1), z.literal(-1)]);

const CollectionMetadataIndexSchema = z.object({
  key: z.record(IndexDirectionSchema),
  v: z.number().optional(),
  name: z.string().optional(),
});
const CollectionMetadataSchema = z.object({
  collectionName: z.string(),
  indexes: z.array(CollectionMetadataIndexSchema),
});

export type CollectionMetadata = z.infer<typeof CollectionMetadataSchema>;

const DatabaseMetadataSchema = z.object({
  databaseName: z.string(),
  collections: z.array(CollectionMetadataSchema),
});

export type DatabaseMetadata = z.infer<typeof DatabaseMetadataSchema>;
export async function loadBraintrustMetadata({
  apiKey,
  projectName,
  datasetName = "database-metadata",
}: LoadBraintrustDatasetParams) {
  const dataset = initDataset(projectName, {
    apiKey,
    dataset: datasetName,
  });
  const metadata: DatabaseMetadata[] = (await dataset.fetchedData())
    .map((d) => DatabaseMetadataDatasetEntrySchema.parse(d))
    .map((m) =>
      DatabaseMetadataSchema.parse({
        databaseName: m.input.databaseName,
        collections: m.input.collections.map((c) => ({
          collectionName: c.collectionName,
          indexes: c.indexes.map((idx) => EJSON.deserialize(idx)),
        })),
      })
    );
  return metadata;
}

const DbDocumentDatasetRecordSchema = z.object({
  input: z.object({
    databaseName: z.string(),
    collectionName: z.string(),
    datasetName: z.string(),
    ejson: z.record(z.unknown()),
  }),
});
export type DbDocumentDatasetRecord = z.infer<
  typeof DbDocumentDatasetRecordSchema
>;

type EnsureConformsTo<T extends U, U> = T;
const MdbDocumentSchema = z.record(z.any());
export type MdbDocument = EnsureConformsTo<
  Document,
  z.infer<typeof MdbDocumentSchema>
>;
export interface DbDocument {
  databaseName: string;
  collectionName: string;
  document: MdbDocument;
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
  const dbDocuments: DbDocument[] = (await dataset.fetchedData())
    .map((d) => DbDocumentDatasetRecordSchema.parse(d))
    .map(({ input }) => {
      return {
        databaseName: input.databaseName,
        collectionName: input.collectionName,
        document: MdbDocumentSchema.parse(EJSON.deserialize(input.ejson)),
      } satisfies DbDocument;
    });

  return dbDocuments;
}
