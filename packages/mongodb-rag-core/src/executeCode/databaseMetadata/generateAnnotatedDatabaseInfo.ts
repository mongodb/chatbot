import { MongoClient } from "mongodb";
import { z } from "zod";
import { LlmOptions } from "./LlmOptions";
import { makeGenerateAnnotatedCollectionSchema } from "./generateAnnotatedCollectionSchema";
import { makeGenerateHighLevelDbDescriptions } from "./generateHighLevelDbDescriptions";
import { getDatabaseMetadata } from "./getDatabaseMetadata";
import { traced } from "braintrust";
import OpenAI from "openai";

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
      // Note: Since LLMs are generally quite bad at generating search indexes,
      // you should include annotations on the indexes passed to the pipeline.
      // If you don't provide the annotations, expect bad results.
      searchIndexes: z
        .array(z.any())
        .optional()
        .describe("Indexes that are used for Atlas Search"),
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
          }),
        )
        .optional()
        .describe("Indexes on the collection."),
    }),
  ),
});

export type DatabaseInfo = z.infer<typeof DatabaseInfoSchema>;

export interface GenerateAnnotatedDatabaseInfoParams {
  mongoDb: {
    mongoClient: MongoClient;
    databaseName: string;
    numSamplesPerCollection?: number;
    searchIndexes?: {
      [collectionName: string]: string[];
    };
  };
  latestDate?: Date;
  llmOptions: LlmOptions;
  openAiClient: OpenAI;
}

/**
  Generated LLM-annotated information about a MongoDB database.
 */
export async function generateAnnotatedDatabaseInfo({
  mongoDb: {
    mongoClient,
    databaseName,
    numSamplesPerCollection = 2,
    searchIndexes,
  },
  latestDate = new Date(),
  llmOptions,
  openAiClient,
}: GenerateAnnotatedDatabaseInfoParams): Promise<DatabaseInfo> {
  // Get raw database metadata
  const databaseMetadata = await getDatabaseMetadata({
    mongoClient,
    databaseName,
    numSamplesPerCollection,
    latestDate,
  });
  const generateHighLevelDbDescriptions =
    makeGenerateHighLevelDbDescriptions(openAiClient);
  const generateAnnotatedCollectionSchema =
    makeGenerateAnnotatedCollectionSchema(openAiClient);
  return traced(
    async () => {
      // Generate high-level database descriptions
      const highLevelDescriptions = await generateHighLevelDbDescriptions(
        databaseMetadata,
        llmOptions,
      );

      // Create initial annotated database info
      const annotatedDatabaseInfo: DatabaseInfo = {
        name: databaseName,
        description: highLevelDescriptions.databaseDescription,
        latestDate,
        collections: databaseMetadata.collections.map((collection, i) => ({
          name: collection.collectionName,
          description:
            highLevelDescriptions.collectionDescriptions[i].description,
          schema: collection.schema,
          examples: collection.exampleDocuments,
          indexes: collection.indexes,
          searchIndexes: searchIndexes?.[collection.collectionName],
        })),
      };

      // Generate detailed schema descriptions for each collection
      for (let i = 0; i < annotatedDatabaseInfo.collections.length; i++) {
        const annotatedCollection = annotatedDatabaseInfo.collections[i];
        const collection = databaseMetadata.collections.find(
          (c) => c.collectionName === annotatedCollection.name,
        );
        if (!collection) {
          continue;
        }

        const { typeScriptSchema, indexDescriptions } =
          await generateAnnotatedCollectionSchema({
            collectionMetadata: collection,
            databaseMetadata,
            llm: llmOptions,
          });

        // Update the collection's schema with the annotated version
        annotatedCollection.schema = typeScriptSchema;

        // Update the collection's indexes with the annotated version
        for (let j = 0; j < (indexDescriptions?.length ?? 0); j++) {
          const indexDescription = indexDescriptions?.[j];
          if (!indexDescription) {
            continue;
          }

          const collectionIndexDescription = annotatedCollection.indexes?.find(
            (index) => index.name === indexDescription.name,
          );

          if (!collectionIndexDescription) {
            continue;
          }

          collectionIndexDescription.description = indexDescription.description;
        }
      }
      return annotatedDatabaseInfo;
    },
    { name: "generateAnnotatedDatabaseInfo" },
  );
}
