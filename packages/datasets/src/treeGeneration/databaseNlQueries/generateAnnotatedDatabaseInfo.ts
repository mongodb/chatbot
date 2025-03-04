import { ObjectId } from "mongodb-rag-core/mongodb";

import { DatabaseInfo, DatabaseInfoNode } from "./nodeTypes";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { generateAnnotatedCollectionSchema } from "./databaseMetadata/generateAnnotatedCollectionSchema";
import { generateHighLevelDbDescriptions } from "./databaseMetadata/generateHighLevelDbDescriptions";
import { getDatabaseMetadata } from "./databaseMetadata/getDatabaseMetadata";
import { LlmOptions } from "./databaseMetadata/LlmOptions";

interface GenerateAnnotatedDatabaseInfoParams {
  mongoDb: {
    mongoClient: MongoClient;
    databaseName: string;
    numSamplesPerCollection?: number;
  };
  latestDate?: Date;
  llm: LlmOptions;
}

async function generateAnnotatedDatabaseInfo({
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

  // Create initial annotated database metadata
  const annotatedDatabaseInfo: DatabaseInfo = {
    name: databaseName,
    description: highLevelDescriptions.databaseDescription,
    latestDate,
    collections: databaseMetadata.collections.map((collection) => ({
      name: collection.collectionName,
      description:
        highLevelDescriptions.collectionDescriptions[collection.collectionName],
      schema: collection.schema,
      examples: collection.exampleDocuments,
      indexes: collection.indexes,
    })),
  };

  // Generate detailed schema descriptions for each collection
  for (let i = 0; i < databaseMetadata.collections.length; i++) {
    const collection = annotatedDatabaseInfo.collections[i];
    const { typeScriptSchema, indexDescriptions } =
      await generateAnnotatedCollectionSchema(
        databaseMetadata,
        collection.name,
        llm
      );

    annotatedDatabaseInfo.collections[i].schema = typeScriptSchema;

    for (let j = 0; j < indexDescriptions.length; j++) {
      const indexDescription = indexDescriptions[j];
      const collectionIndexDescription = collection.indexes.find(
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

export async function generateAnnotatedDatabaseMetadata(
  params: GenerateAnnotatedDatabaseInfoParams
): Promise<DatabaseInfoNode> {
  const annotatedDatabaseInfo = await generateAnnotatedDatabaseInfo(params);

  return {
    _id: new ObjectId(),
    parent: null,
    data: annotatedDatabaseInfo,
    updated: new Date(),
  };
}
