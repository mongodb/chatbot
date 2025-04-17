import { MongoClient, ObjectId } from "mongodb-rag-core/mongodb";
import { DatabaseInfoNode } from "./nodeTypes";
import { LlmOptions } from "./LlmOptions";
import { generateAnnotatedDatabaseInfo } from "mongodb-rag-core/executeCode";

export interface GenerateAnnotatedDatabaseInfoParams {
  mongoDb: {
    mongoClient: MongoClient;
    databaseName: string;
    numSamplesPerCollection?: number;
  };
  latestDate?: Date;
  llm: LlmOptions;
}

export async function generateAnnotatedDatabaseInfoNode({
  mongoDb: { mongoClient, databaseName, numSamplesPerCollection = 2 },
  latestDate = new Date(),
  llm,
}: GenerateAnnotatedDatabaseInfoParams): Promise<DatabaseInfoNode> {
  const annotatedDatabaseInfo = await generateAnnotatedDatabaseInfo({
    mongoDb: { mongoClient, databaseName, numSamplesPerCollection },
    latestDate,
    llm,
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
