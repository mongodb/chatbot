import { ExecOptions } from "child_process";
import { Document } from "mongodb";

export interface ExecuteMongoDbQueryParams {
  query: string;
  uri: string;
  databaseName: string;
  execOptions?: ExecOptions;
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
   */
  executionTimeMs: number;
}
