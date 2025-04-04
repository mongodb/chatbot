import { MongoClient } from "mongodb";
import { z } from "zod";
import { LlmOptions } from "./LlmOptions";
import { generateAnnotatedCollectionSchema } from "./generateAnnotatedCollectionSchema";
import { generateHighLevelDbDescriptions } from "./generateHighLevelDbDescriptions";
import { getDatabaseMetadata } from "./getDatabaseMetadata";

export const DatabaseInfoSchema = z.object({
  name: z.string().describe("Name of the database"),
  description: z.string().describe("Brief description of the database"),
  latestDate: z.date().describe("Latest date in the database"),
  collections: z.array(
    z.object({
      name: z.string(),
      description: z.string(),
      schema: z.any(),
      examples: z.array(z.any()),
      indexes: z
        .array(
          z.object({
            description: z.string().optional(),
            name: z.string(),
            key: z.any(),
            unique: z.boolean().optional(),
            v: z.number().optional(),
            background: z.boolean().optional(),
            "2dsphereIndexVersion": z.number().optional(),
          })
        )
        .describe("Indexes on the collection."),
    })
  ),
});

export type DatabaseInfo = z.infer<typeof DatabaseInfoSchema>;

export interface GenerateAnnotatedDatabaseInfoParams {
  mongoDb: {
    mongoClient: MongoClient;
    databaseName: string;
    numSamplesPerCollection?: number;
  };
  latestDate?: Date;
  llm: LlmOptions;
}

/**
  Generated LLM-annotated information about a MongoDB database.
 */
export async function generateAnnotatedDatabaseInfo({
  mongoDb: { mongoClient, databaseName, numSamplesPerCollection = 2 },
  latestDate = new Date(),
  llm,
}: GenerateAnnotatedDatabaseInfoParams): Promise<DatabaseInfo> {
  // Get raw database metadata
  const databaseMetadata = await getDatabaseMetadata({
    mongoClient,
    databaseName,
    numSamplesPerCollection,
    latestDate,
  });

  // Generate high-level database descriptions
  const highLevelDescriptions = await generateHighLevelDbDescriptions(
    databaseMetadata,
    llm
  );

  // Create initial annotated database info
  const annotatedDatabaseInfo: DatabaseInfo = {
    name: databaseName,
    description: highLevelDescriptions.databaseDescription,
    latestDate,
    collections: databaseMetadata.collections.map((collection, i) => ({
      name: collection.collectionName,
      description: highLevelDescriptions.collectionDescriptions[i].description,
      schema: collection.schema,
      examples: collection.exampleDocuments,
      indexes: collection.indexes,
    })),
  };

  // Generate detailed schema descriptions for each collection
  for (let i = 0; i < annotatedDatabaseInfo.collections.length; i++) {
    const annotatedCollection = annotatedDatabaseInfo.collections[i];
    const collection = databaseMetadata.collections.find(
      (c) => c.collectionName === annotatedCollection.name
    );
    if (!collection) {
      continue;
    }

    const { typeScriptSchema, indexDescriptions } =
      await generateAnnotatedCollectionSchema({
        collectionMetadata: collection,
        databaseMetadata,
        llm,
      });

    // Update the collection's schema with the annotated version
    annotatedCollection.schema = typeScriptSchema;

    // Update the collection's indexes with the annotated version
    for (let j = 0; j < indexDescriptions.length; j++) {
      const indexDescription = indexDescriptions[j];

      const collectionIndexDescription = annotatedCollection.indexes.find(
        (index) => index.name === indexDescription.name
      );

      if (!collectionIndexDescription) {
        continue;
      }

      collectionIndexDescription.description = indexDescription.description;
    }
  }
  return annotatedDatabaseInfo;
}
