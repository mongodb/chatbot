import { DatabaseExecutionResultNode } from "./databaseNlQueries/databaseNodes/nodeTypes";

export type DatabaseNlQueryDatasetEntry =
  DatabaseExecutionResultNode["data"] & {
    language: string;
    nlQuery: string;
    complexity: string;
    databaseName: string;
    dbQuery: string;
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
