import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { DatabaseInfoNode } from "./nodeTypes";
import { LlmOptions } from "mongodb-rag-core/executeCode";
import { generateAnnotatedDatabaseInfo } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";

export interface GenerateAnnotatedDatabaseInfoParams {
  mongoDb: {
    mongoClient: MongoClient;
    databaseName: string;
    numSamplesPerCollection?: number;
  };
  latestDate?: Date;
  llmOptions: LlmOptions;
  openAiClient: OpenAI;
}

export async function generateAnnotatedDatabaseInfoNode({
  mongoDb: { mongoClient, databaseName, numSamplesPerCollection = 2 },
  latestDate = new Date(),
  llmOptions,
  openAiClient,
}: GenerateAnnotatedDatabaseInfoParams): Promise<DatabaseInfoNode> {
  const annotatedDatabaseInfo = await generateAnnotatedDatabaseInfo({
    mongoDb: { mongoClient, databaseName, numSamplesPerCollection },
    latestDate,
    llmOptions,
    openAiClient,
  });
  // Return the final DatabaseInfoNode
  return {
    _id: new ObjectId(),
    parent: null,
    type: "database_info",
    data: annotatedDatabaseInfo,
    updated: new Date(),
  };
}
