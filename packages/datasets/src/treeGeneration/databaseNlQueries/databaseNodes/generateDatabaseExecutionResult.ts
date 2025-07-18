import { ObjectId } from "mongodb-rag-core/mongodb";
import { DatabaseCodeNode, DatabaseExecutionResultNode } from "./nodeTypes";
import {
  ExecuteMongoDbQuery,
  extractMongoDbMethods,
  extractMongoDbQueryOperators,
} from "mongodb-rag-core/executeCode";
import { wrapTraced } from "mongodb-rag-core/braintrust";

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
export const generateDatabaseExecutionResult = wrapTraced(
  async function ({
    generatedQuery,
    database,
    executor,
  }: ExecuteGeneratedQueryParams): Promise<DatabaseExecutionResultNode> {
    const query = generatedQuery.data.code;
    const { uri, name: databaseName } = database;

    const executionResult = await executor({
      query,
      uri,
      databaseName,
    });

    const metadata = {
      queryOperators: extractMongoDbQueryOperators(query),
      methods: extractMongoDbMethods(query),
    };

    const data = { ...executionResult, ...metadata };
    return {
      _id: new ObjectId(),
      parent: generatedQuery,
      type: "database_execution_result",
      updated: new Date(),
      data,
    };
  },
  {
    name: "generateDatabaseExecutionResult",
  }
);
