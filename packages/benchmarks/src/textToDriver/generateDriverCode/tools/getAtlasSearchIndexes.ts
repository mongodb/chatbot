import { tool, Tool, zodSchema } from "mongodb-rag-core/aiSdk";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { z } from "zod";

export const getAtlasSearchIndexesToolName = "atlas-search-indexes";
export const makeGetAtlasSearchIndexesTool = (
  mongoClient: MongoClient,
): Tool => {
  return tool({
    name: getAtlasSearchIndexesToolName,
    description: "Get the Atlas Search indexes for a collection",
    inputSchema: zodSchema(
      z.object({
        databaseName: z.string(),
        collectionName: z.string(),
      }),
    ),
    execute: wrapTraced(
      async ({ databaseName, collectionName }) => {
        const collection = mongoClient
          .db(databaseName)
          .collection(collectionName);
        const indexes = await collection.listSearchIndexes().toArray();
        return indexes;
      },
      {
        name: getAtlasSearchIndexesToolName,
      },
    ),
  });
};
