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
  Extracts collection name from a MongoDB query string
  @param query - The MongoDB query string (e.g., "db.users.find({})")
  @returns The collection name or null if not found
 */
export function extractCollectionName(query: string): string | null {
  // Match patterns like db.collectionName.method() or db['collectionName'].method()
  const patterns = [
    /db\.([a-zA-Z_][a-zA-Z0-9_]*)\.\w+\s*\(/,
    /db\[['"](.*?)['"]]\./,
    /db\.getCollection\(['"]([^'"]+)['"]\)/,
  ];

  for (const pattern of patterns) {
    const match = query.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}

/**
  Transforms a MongoDB query to include .explain() for execution analysis
  @param query - The original MongoDB query
  @returns The query with .explain() added
 */
export function addExplainToQuery(query: string): string {
  // Handle different query patterns - add .explain() at the end
  const patterns = [
    // db.collection.method(...) -> db.collection.method(...).explain()
    {
      pattern:
        /(db\.\w+\.(find|findOne|aggregate|count|distinct|update|remove|delete)\s*\([^)]*\))/,
      replacement: "$1.explain()",
    },
    // db['collection'].method(...) -> db['collection'].method(...).explain()
    {
      pattern:
        /(db\[['"][^'"]+['"]\]\.(find|findOne|aggregate|count|distinct|update|remove|delete)\s*\([^)]*\))/,
      replacement: "$1.explain()",
    },
    // db.getCollection('collection').method(...) -> db.getCollection('collection').method(...).explain()
    {
      pattern:
        /(db\.getCollection\((['"])[^'"]+\2\)\.(find|findOne|aggregate|count|distinct|update|remove|delete)\s*\([^)]*\))/,
      replacement: "$1.explain()",
    },
  ];

  for (const { pattern } of patterns) {
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
  collectionName: string;
  totalDocs: number;
  queryEfficiency: number;
}

/**
  Calls MongoDB .explain() on the query and analyzes performance
  @param query - The MongoDB query to explain
  @param databaseName - The database name for execution context
  @returns Explain output with performance metrics
 */
export async function explainQuery(
  dbQuery: string,
  databaseName: string,
  connectionUri: string
): Promise<QueryProfile | null> {
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
      return null;
    }

    // Step 3: Parse the explain output
    const explainOutput = ExplainOutputSchema.parse(executionResult.result);

    // Extract collection name from namespace or original query
    const namespace = explainOutput.queryPlanner.namespace;
    const collectionName = namespace.includes(".")
      ? namespace.split(".").slice(1).join(".")
      : extractCollectionName(dbQuery);

    // If we can't extract the collection name, return null
    if (!collectionName) {
      return null;
    }

    // Step 4: Get total document count
    const totalDocs = await getMongoshCollectionDocumentCount(
      connectionUri,
      collectionName,
      databaseName
    );

    // Step 5: Calculate query efficiency
    const queryEfficiency = calculateQueryEfficiency(explainOutput, totalDocs);

    return {
      explainOutput,
      collectionName,
      totalDocs,
      queryEfficiency,
    };
  } catch (error) {
    // If any error occurs (invalid query, parsing error, etc.), return null
    return null;
  }
}
