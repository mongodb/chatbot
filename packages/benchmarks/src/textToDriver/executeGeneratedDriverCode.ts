import { Document, MongoClient } from "mongodb-rag-core";
import vm from "vm";

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

export interface ExecuteGeneratedDriverCodeResult {
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

/**
  Execute the generated driver code using the provided MongoDB client instance.

  This function expects that the generated driver code
  uses the `database` variable of type `Db` to access the MongoDB database.
  If you do not provide a `database` variable in the generated driver code,
  this function will not work as expected.

 */
export async function executeGeneratedDriverCode(
  params: ExecuteGeneratedDriverCodeParams
): Promise<{
  result: Document | Document[] | number | null;
  error?: {
    message: string;
  };
  executionTimeMs: number;
}> {
  const { generatedDriverCode, mongoClient, databaseName } = params;
  const database = mongoClient.db(databaseName);

  // Wrap the generated code in an async IIFE to guarantee that it returns a Promise
  const promiseCode = `(async () => { return ${generatedDriverCode} })()`;
  
  const startTime = Date.now();

  try {
    const result = await vm.runInNewContext(promiseCode, { database });

    const endTime = Date.now();

    return {
      result,
      executionTimeMs: endTime - startTime,
    };
  } catch (error: any) {
    const endTime = Date.now();
    return {
      result: null,
      error: {
        message: error.message || "An unknown error occurred",
      },
      executionTimeMs: endTime - startTime,
    };
  }
}
