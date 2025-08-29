import { MongoClient, BSON } from "mongodb";
import { ExecuteMongoDbQuery } from "./DatabaseExecutionResult";
import { strict as assert } from "assert";
/**
  Executes MongoDB query formatted in EJSON.

  Uses MongoDB Node.js driver to execute the query.
 */
export function makeExecuteEjsonAggregationQuery({
  mongoClient,
}: {
  mongoClient: MongoClient;
}): ExecuteMongoDbQuery {
  return async ({ query, databaseName, collectionName }) => {
    let executionTimeMs: number | null = null;
    try {
      assert(typeof query === "string", "query must be a string");
      assert(collectionName, "collectionName is required");

      const startTime = Date.now();
      const db = mongoClient.db(databaseName);

      const documentQuery = JSON.parse(query).map((q: any) =>
        BSON.EJSON.deserialize(q),
      );
      const result = await db
        .collection(collectionName)
        .aggregate(documentQuery)
        .toArray();
      const endTime = Date.now();
      executionTimeMs = endTime - startTime;

      return {
        result,
        executionTimeMs,
        error: undefined,
      };
    } catch (execError: any) {
      const error = {
        message: execError.message ?? "Failed to execute aggregation query",
      };

      return {
        result: null,
        executionTimeMs: null,
        error,
      };
    }
  };
}
