import { Document, ObjectId, BSON } from "mongodb-rag-core/mongodb";
import {
  DatabaseCodeNode,
  DatabaseExecutionResult,
  DatabaseExecutionResultNode,
} from "./nodeTypes";
import assert from "assert/strict";
import { exec } from "child_process";
import { promisify } from "util";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";
import { tmpdir } from "os";

const execAsync = promisify(exec);

export interface ExecuteGeneratedQueryParams {
  generatedQuery: DatabaseCodeNode;
  database: {
    name: string;
    uri: string;
  };
  executor: (
    query: string,
    uri: string,
    databaseName: string
  ) => Promise<DatabaseExecutionResult>;
}

export const executeMqlQuery: ExecuteGeneratedQueryParams["executor"] = async (
  query,
  uri,
  databaseName
) => {
  let result: Document | Document[] | number | null = null;
  let error: { message: string } | undefined = undefined;

  // Create a temporary file path
  const tmpFilePath = join(tmpdir(), `mongosh-query-${Date.now()}.js`);

  // TODO: make such that it's null or undefined if the query fails...
  let executionTimeMs = 0;
  try {
    const connectionUrl = new URL(uri);
    connectionUrl.pathname = databaseName;

    // Prepare the script with proper database connection
    const scriptContent = `
      // Initialize the database connection
      const db = db.getSiblingDB("${databaseName}");
      
      // Execute the query
      const result = ${query}.toArray();
      printjson(EJSON.stringify(result));`;

    // Write the query to a temporary file
    await writeFile(tmpFilePath, scriptContent);
    const startTime = Date.now();

    // Execute the query using the file
    const { stdout, stderr } = await execAsync(
      `mongosh ${connectionUrl.toString()} --quiet --file ${tmpFilePath}`
    );
    const endTime = Date.now();
    executionTimeMs = endTime - startTime;

    if (stderr && stderr.trim()) {
      error = { message: stderr.trim() };
    } else if (stdout.trim()) {
      // Parse the output as EJSON
      try {
        console.log("out::", stdout.trim());
        result = BSON.EJSON.parse(stdout.trim(), { relaxed: true });
        console.log({ result });
      } catch (parseError: any) {
        error = {
          message: `Failed to parse mongosh output: ${parseError.message}`,
        };
      }
    }
  } catch (execError: any) {
    error = {
      message: execError.message || "Failed to execute mongosh command",
    };
  } finally {
    // Clean up the temporary file
    try {
      await unlink(tmpFilePath);
    } catch (unlinkError) {
      // Ignore errors during cleanup
    }
  }

  const data = {
    result,
    executionTimeMs,
    error,
  };
  return data;
};

/**
  Execute the generated query using the `mongosh` CLI.
 */
export async function generateDatabaseExecutionResults({
  generatedQuery,
  database,
  executor,
}: ExecuteGeneratedQueryParams): Promise<DatabaseExecutionResultNode> {
  assert(
    generatedQuery.data.language === "mongosh",
    `Expected mongosh query. Received ${generatedQuery.data.language}`
  );
  const mongoshQuery = generatedQuery.data.code;
  const { uri, name } = database;

  const data = await executor(mongoshQuery, uri, name);

  return {
    _id: new ObjectId(),
    parent: generatedQuery,
    updated: new Date(),
    data,
  };
}
