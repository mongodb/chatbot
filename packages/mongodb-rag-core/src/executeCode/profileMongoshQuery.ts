import { z } from "zod";
import { executeMongoshQuery } from "./executeMongoshQuery";

/**
  Zod schema for MongoDB explain output
 */
export const ExplainOutputSchema = z.object({
  executionStats: z.object({
    nReturned: z.number(),
    totalDocsExamined: z.number(),
    totalKeysExamined: z.number(),
    executionTimeMillis: z.number(),
  }),
  queryPlanner: z.object({
    namespace: z.string(),
    winningPlan: z.any(),
  }),
});

type ExplainOutput = z.infer<typeof ExplainOutputSchema>;

/**
  Transforms a MongoDB query to include .explain() for execution analysis
  @param query - The original MongoDB query
  @returns The query with .explain() added
 */
export function addExplainToQuery(query: string): string {
  // Handle findOne() specially - convert to find().limit(1).explain()
  const findOnePatterns = [
    /(db\.\w+)\.findOne\s*\(([^)]*)\)/,
    /(db\[['"][^'"]+['"]\])\.findOne\s*\(([^)]*)\)/,
    /(db\.getCollection\((['"])[^'"]+\2\))\.findOne\s*\(([^)]*)\)/,
  ];

  for (let i = 0; i < findOnePatterns.length; i++) {
    const pattern = findOnePatterns[i];
    if (pattern.test(query)) {
      if (i === 2) { // getCollection pattern has different capture groups
        return query.replace(pattern, '$1.find($3).limit(1).explain("executionStats")');
      } else {
        return query.replace(pattern, '$1.find($2).limit(1).explain("executionStats")');
      }
    }
  }

  // Handle other operations that support .explain() directly
  const patterns = [
    // db.collection.method(...) with optional chained methods -> db.collection.method(...).chainedMethods().explain()
    /(db\.\w+\.(find|aggregate|count|distinct|update|remove|delete)\s*\([^)]*\)(?:\.\w+\s*\([^)]*\))*)/,

    // db['collection'].method(...) with optional chained methods -> db['collection'].method(...).chainedMethods().explain()
    /(db\[['"][^'"]+['"]\]\.(find|aggregate|count|distinct|update|remove|delete)\s*\([^)]*\)(?:\.\w+\s*\([^)]*\))*)/,

    // db.getCollection('collection').method(...) with optional chained methods -> db.getCollection('collection').method(...).chainedMethods().explain()
    /(db\.getCollection\((['"])[^'"]+\2\)\.(find|aggregate|count|distinct|update|remove|delete)\s*\([^)]*\)(?:\.\w+\s*\([^)]*\))*)/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(query)) {
      // Add .explain("executionStats") to get execution statistics
      return query.replace(pattern, '$1.explain("executionStats")');
    }
  }

  // If no pattern matches, try to add .explain() at the end
  // This handles edge cases but might be less reliable
  return query.trimEnd() + '.explain("executionStats")';
}

/**
  Gets the total document count for a collection
  @param collectionName - The name of the collection
  @param databaseName - The name of the database
  @returns The total number of documents in the collection
 */
export async function getMongoshCollectionDocumentCount(
  connectionUri: string,
  collectionName: string,
  databaseName: string
): Promise<number> {
  const result = await executeMongoshQuery({
    query: `db.${collectionName}.countDocuments()`,
    databaseName,
    uri: connectionUri,
  });

  // Handle different possible return formats
  if (typeof result.result === "number") {
    return result.result;
  }

  if (
    result.result &&
    typeof result.result === "object" &&
    "count" in result.result
  ) {
    return (result.result as { count: number }).count;
  }

  throw new Error("Unexpected count result format");
}

/**
  Calculates query efficiency based on explain output and total documents
  @param explainOutput - The parsed explain output
  @param totalDocs - Total documents in the collection
  @returns Query efficiency score between 0 and 1
 */
export function calculateQueryEfficiency(
  explainOutput: ExplainOutput,
  totalDocs: number
): number {
  const { nReturned, totalDocsExamined } = explainOutput.executionStats;

  // Perfect efficiency: examined exactly what was returned
  if (totalDocsExamined === nReturned) {
    return 1.0;
  }

  // Avoid division by zero
  if (totalDocs === 0) {
    return 0;
  }

  // Calculate efficiency: 1 - (unnecessary examinations / total docs)
  const unnecessaryExaminations = totalDocsExamined - nReturned;
  const efficiency = 1 - unnecessaryExaminations / totalDocs;

  // Clamp between 0 and 1
  return Math.max(0, Math.min(1, efficiency));
}

export interface QueryProfile {
  explainOutput: ExplainOutput;
  collection: {
    name: string;
    documentCount: number;
  };
}

// helper function to extract collection name from explain output
function extractCollectionName(explainOutput: ExplainOutput): string | null {
  const namespace = explainOutput.queryPlanner.namespace;
  if (namespace.includes(".")) {
    return namespace.split(".").slice(1).join(".");
  } else {
    throw new Error(
      "Could not extract collection name from explain output namespace"
    );
  }
}

export type ProfileMongoshQueryReturnValue =
  | {
      profile: QueryProfile;
      error: null;
    }
  | {
      profile: null;
      error: { message: string };
    };

/**
  Calls MongoDB .explain() on the query and analyzes performance
  @param query - The MongoDB query to explain
  @param databaseName - The database name for execution context
  @returns Explain output with performance metrics
 */
export async function profileMongoshQuery(
  dbQuery: string,
  databaseName: string,
  connectionUri: string
): Promise<ProfileMongoshQueryReturnValue> {
  try {
    // Step 1: Add explain to the query
    const explainQuery = addExplainToQuery(dbQuery);

    // Step 2: Execute the explain query
    const executionResult = await executeMongoshQuery({
      query: explainQuery,
      databaseName,
      uri: connectionUri,
    });
    if (!executionResult.result) {
      // If the query failed (e.g., invalid syntax), return null

      return {
        profile: null,
        error: {
          message:
            executionResult.error?.message ??
            "Unknown error executing explain query",
        },
      };
    }

    // Step 3: Parse the explain output
    const explainOutput = ExplainOutputSchema.parse(executionResult.result);

    const collectionName = extractCollectionName(explainOutput);

    // If we can't extract the collection name, return null
    if (!collectionName) {
      return {
        profile: null,
        error: { message: "Could not extract collection name from query" },
      };
    }

    // Step 4: Get total document count
    const collectionDocumentCount = await getMongoshCollectionDocumentCount(
      connectionUri,
      collectionName,
      databaseName
    );

    return {
      profile: {
        explainOutput,
        collection: {
          name: collectionName,
          documentCount: collectionDocumentCount,
        },
      },
      error: null,
    };
  } catch (error) {
    // If any error occurs (invalid query, parsing error, etc.), return null
    return {
      profile: null,
      error: {
        message: error instanceof Error ? error.message : "Unknown error",
      },
    };
  }
}
