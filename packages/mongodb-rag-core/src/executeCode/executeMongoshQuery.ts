import { Document, BSON } from "mongodb";
import { exec } from "child_process";
import { promisify } from "util";
import { ExecuteMongoDbQuery } from "./DatabaseExecutionResult";
import { redactMongoDbConnectionUri } from "./redactMongoDbConnectionUri";

const execAsync = promisify(exec);

/**
  Executes MongoDB query using `mongosh` CLI.
  Note that Mongosh must be installed on the system running this function
  for it to successfully execute.
 */
export const executeMongoshQuery: ExecuteMongoDbQuery = async ({
  query,
  uri,
  databaseName,
  execOptions,
}) => {
  let result: Document | Document[] | number | null = null;
  let error: { message: string } | undefined = undefined;

  let executionTimeMs: number | null = null;
  try {
    const connectionUrl = new URL(uri);
    connectionUrl.pathname = databaseName;
    const startTime = Date.now();

    const modifiedQuery = appendToArrayIfNeeded(query);
    const escapedQuery = modifiedQuery.replace(/'/g, "'\\''");

    const { stdout, stderr } = await execAsync(
      `mongosh "${connectionUrl.toString()}" --quiet --json=relaxed --eval '${escapedQuery}'`,
      {
        maxBuffer: 1024 * 1024 * 30, // 30 MB
        timeout: 30000,
        ...execOptions,
      }
    );
    const endTime = Date.now();
    executionTimeMs = endTime - startTime;

    if (stderr && stderr.trim()) {
      error = { message: stderr.trim() };
      executionTimeMs = null;
    } else if (stdout.trim()) {
      try {
        result = BSON.EJSON.parse(stdout.trim(), { relaxed: true });
      } catch (parseError: any) {
        error = {
          message: `Failed to parse mongosh output: ${parseError.message}`,
        };
        executionTimeMs = null;
      }
    }
  } catch (execError: any) {
    error = {
      message: execError.message || "Failed to execute mongosh command",
    };
  }

  // Redact any MongoDB connection URIs in error messages
  if (error && error.message) {
    error.message = redactMongoDbConnectionUri(error.message);
  }

  const data = {
    result,
    executionTimeMs,
    error,
  };
  return data;
};

/**
  Append .toArray() to cursor-returning operations if not already present. 
*/
function appendToArrayIfNeeded(query: string) {
  query = query.trim();

  // Don't add .toArray() if .explain() is present or .toArray() already exists
  if (query.includes(".explain(") || query.includes(".toArray()")) {
    return query;
  }

  // Regex to match cursor-returning operations
  const cursorReturningOperations =
    /(db\.\w+\.(find|aggregate|listCollections|listIndexes)\()/;

  if (cursorReturningOperations.test(query)) {
    return query.replace(/\)\s*;?$/, ").toArray();");
  }

  return query;
}
