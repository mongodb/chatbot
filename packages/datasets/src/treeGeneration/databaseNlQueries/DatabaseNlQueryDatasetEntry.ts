import { DatabaseExecutionResultNode } from "./databaseNodes/nodeTypes";
import { z } from "zod";
export type DatabaseNlQueryDatasetEntry =
  DatabaseExecutionResultNode["data"] & {
    language: string;
    nlQuery: string;
    complexity: string;
    databaseName: string;
    dbQuery: string;
    generationUuid?: string;
  };

export function generateDatabaseNlQueryDatasetEntry(
  dbExecutionNode: DatabaseExecutionResultNode
): DatabaseNlQueryDatasetEntry {
  return {
    nlQuery: dbExecutionNode.parent.parent.data.query,
    dbQuery: dbExecutionNode.parent.data.code,
    language: dbExecutionNode.parent.data.language,
    ...dbExecutionNode.data,
    complexity: dbExecutionNode.parent.parent.data.complexity,
    databaseName: dbExecutionNode.parent.parent.parent.parent.parent.data.name,
  };
}

export function convertDatabaseNlQueryDatasetEntryToBraintrust(
  entry: DatabaseNlQueryDatasetEntry
): DatabaseNlQueryDatasetEntryBraintrust {
  const tags = [entry.complexity, entry.language, entry.databaseName];
  return {
    input: {
      nlQuery: entry.nlQuery,
      databaseName: entry.databaseName,
    },
    expected: {
      dbQuery: entry.dbQuery,
      result: entry.result,
      executionTimeMs: entry.executionTimeMs,
    },
    tags,
    metadata: {
      methods: entry.methods,
      queryOperators: entry.queryOperators,
      language: entry.language,
      complexity: entry.complexity,
      generationUuid: entry.generationUuid,
    },
  };
}

export function convertBraintrustDatabaseNlQueryDatasetEntryToFlat(
  entry: DatabaseNlQueryDatasetEntryBraintrust
): DatabaseNlQueryDatasetEntry {
  return {
    nlQuery: entry.input.nlQuery,
    dbQuery: entry.expected.dbQuery,
    language: entry.metadata.language,
    complexity: entry.metadata.complexity,
    databaseName: entry.input.databaseName,
    result: entry.expected.result,
    executionTimeMs: entry.expected.executionTimeMs,
    methods: entry.metadata.methods,
    queryOperators: entry.metadata.queryOperators,
    generationUuid: entry.metadata.generationUuid,
  };
}
/**
  Dataset entry as stored in Braintrust
 */
export const DatabaseNlQueryDatasetEntryBraintrustSchema = z.object({
  input: z.object({
    nlQuery: z.string(),
    databaseName: z.string(),
  }),
  expected: z.object({
    dbQuery: z.string(),
    result: z.any(),

    executionTimeMs: z.number().nullable(),
  }),
  tags: z.array(z.string()),
  metadata: z.object({
    methods: z.array(z.string()).optional(),
    queryOperators: z.array(z.string()).optional(),
    language: z.string(),
    complexity: z.string(),
    generationUuid: z.string().optional(),
  }),
});

export type DatabaseNlQueryDatasetEntryBraintrust = z.infer<
  typeof DatabaseNlQueryDatasetEntryBraintrustSchema
>;
