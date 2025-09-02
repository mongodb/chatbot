import { Document } from "mongodb";

export interface ExecuteMongoDbQueryParams {
  query: string;
  databaseName: string;
  /**
    Required for some executors, but not others.
   */
  collectionName?: string;
}

export type ExecuteMongoDbQuery = (
  params: ExecuteMongoDbQueryParams
) => Promise<DatabaseExecutionResult>;

export interface DatabaseExecutionResult {
  /**
    The result of executing the generated driver code.
    `null` if no result was returned.
   */
  result: Document | Document[] | number | null;
  /**
    An error message if an error occurred during execution.
   */
  error?: {
    message: string;
  };
  /**
    The time in milliseconds it took to execute the generated driver code.
    `null` if execution failed or not tracked.
   */
  executionTimeMs: number | null;
}
