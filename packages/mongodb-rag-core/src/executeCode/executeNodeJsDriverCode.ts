import { MongoClient } from "mongodb";
import vm from "vm";
import { extractCodeFromMarkdown } from "./extractCodeFromMarkdown";
import { DatabaseExecutionResult } from "./DatabaseExecutionResult";

export interface ExecuteGeneratedDriverCodeParams {
  /**
    MongoDB client instance to use for executing the generated driver code.
   */
  mongoClient: MongoClient;
  /**
    The generated driver code to execute.
    @example database.collection("myCollection").find({}).toArray();
   */
  generatedDriverCode: string;
  /**
    The name of the database to use for executing the generated driver code.
   */
  databaseName: string;
}

/**
  Execute the Node.js driver code using the provided MongoDB client instance.

  This function expects that the driver code
  uses the `database` variable of type `Db` to access the MongoDB database.
  If you do not provide a `database` variable in the driver code,
  this function will not work as expected.

 */
export async function executeNodeJsDriverCode(
  params: ExecuteGeneratedDriverCodeParams
): Promise<DatabaseExecutionResult> {
  const { generatedDriverCode, mongoClient, databaseName } = params;
  const database = mongoClient.db(databaseName);

  // Wrap the generated code in an async IIFE to guarantee that it returns a Promise
  const promiseCode = `(async () => (
  ${removeTrailingSemiColon(extractCodeFromMarkdown(generatedDriverCode))}
))()`;

  const startTime = Date.now();

  try {
    const result = await vm.runInNewContext(promiseCode, { database });

    const endTime = Date.now();

    return {
      result,
      executionTimeMs: endTime - startTime,
    };
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    return {
      result: null,
      error: {
        message: errorMessage,
      },
      executionTimeMs: null,
    };
  }
}

function removeTrailingSemiColon(code: string): string {
  return code.replace(/;$/, "");
}
