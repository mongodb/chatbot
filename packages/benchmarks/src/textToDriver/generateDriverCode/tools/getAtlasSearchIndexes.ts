import { tool } from "mongodb-rag-core/aiSdk";
import { MongoClient } from "mongodb-rag-core/mongodb";
import { z } from "zod";

export const getAtlasSearchIndexesToolName = "atlas-search-indexes";
export const makeGetAtlasSearchIndexesTool = (mongoClient: MongoClient) => {
  return tool({
    name: getAtlasSearchIndexesToolName,
    description: "Get the Atlas Search indexes for a collection",
    inputSchema: z.object({
      databaseName: z.string(),
      collectionName: z.string(),
    }),
    execute: async ({ databaseName, collectionName }) => {
      const collection = mongoClient
        .db(databaseName)
        .collection(collectionName);
      const indexes = await collection.listSearchIndexes().toArray();
      return indexes;
    },
  });
};
