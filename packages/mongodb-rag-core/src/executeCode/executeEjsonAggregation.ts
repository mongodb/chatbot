import { MongoClient } from "mongodb";
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
  return async ({ query, databaseName }) => {
    let executionTimeMs: number | null = null;
    try {
      assert(Array.isArray(query), "query must be an array");
      const startTime = Date.now();
      const db = mongoClient.db(databaseName);
      const result = await db.aggregate(query).toArray();
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
