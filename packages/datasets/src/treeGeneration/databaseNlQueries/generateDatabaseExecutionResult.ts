import { ObjectId } from "mongodb-rag-core/mongodb";
import { DatabaseCodeNode, DatabaseExecutionResultNode } from "./nodeTypes";
import { ExecuteMongoDbQuery } from "mongodb-rag-core/executeCode";

export interface ExecuteGeneratedQueryParams {
  generatedQuery: DatabaseCodeNode;
  database: {
    name: string;
    uri: string;
  };
  executor: ExecuteMongoDbQuery;
}

/**
  Execute the generated query.
 */
export async function generateDatabaseExecutionResult({
  generatedQuery,
  database,
  executor,
}: ExecuteGeneratedQueryParams): Promise<DatabaseExecutionResultNode> {
  const query = generatedQuery.data.code;
  const { uri, name: databaseName } = database;

  const data = await executor({ query, uri, databaseName });

  return {
    _id: new ObjectId(),
    parent: generatedQuery,
    type: "database_execution_result",
    updated: new Date(),
    data,
  };
}
