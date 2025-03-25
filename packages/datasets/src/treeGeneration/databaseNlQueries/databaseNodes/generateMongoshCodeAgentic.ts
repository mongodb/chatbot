import { makeGenerateNChoiceChildrenWithOpenAi } from "../../generateChildren";
import {
  DatabaseNlQueryNode,
  DatabaseCodeNode,
  DatabaseCodeSchema,
  DatabaseCode,
} from "./nodeTypes";
import {
  makePromptDbInfo,
  makePromptNaturalLanguageQueryInfo,
} from "./makePromptComponents";
import { OpenAIProvider } from "@ai-sdk/openai";
import { generateText, tool } from "ai";
import { z } from "zod";
import { DatabaseInfo, NaturalLanguageQuery } from "./nodeTypes";
import {
  DatabaseExecutionResult,
  executeMongoshQuery,
  extractMongoDbMethods,
  extractMongoDbQueryOperators,
} from "mongodb-rag-core/executeCode";
import { truncateDbOperationOutputForLlm } from "../databaseMetadata/truncateDbOperationOutputForLlm";
import { LlmOptions } from "./LlmOptions";
import { ObjectId } from "mongodb-rag-core/mongodb";

const abstractOutputExample: DatabaseCode = {
  queryPlan: "<query plan here>",
  code: "<mongosh code here>",
  language: "mongosh",
};

const THINK_TOOL_NAME = "think";
const GENERATE_DB_CODE_TOOL_NAME = "generate_db_code";

export const nlQuerySystemPrompt = `You are an expert data analyst experienced at using MongoDB.
Your job is to take information about a MongoDB database plus a natural language query and generate a MongoDB shell (mongosh) query to execute to retrieve the information needed to answer the natural language query.

In your response include a query plan, where you think step-by-step about how to best execute the query before providing the final mongosh output.

Format the mongosh query in the following structure:

\`db.<collection name>.find({/* query */})\` or \`db.<collection name>.aggregate({/* query */})\`

Some general query-authoring tips:

1. Ensure proper use of MongoDB operators ($eq, $gt, $lt, etc.) and data types (ObjectId, ISODate)
2. Include appropriate projections to return only necessary fields
3. For complex queries, use aggregation pipeline with proper stages ($match, $group, $lookup, etc.)
4. Consider performance by utilizing available indexes and optimizing query patterns
5. Include sorting (.sort()) and limiting (.limit()) when appropriate for result set management
6. Handle null values and existence checks explicitly.
7. For date operations, use proper MongoDB date operators ($dateToString, $dateToParts, etc.)
8. For date operations, NEVER use an empty new date object (e.g. \`new Date()\`). ALWAYS specify the date, such as \`new Date("2024-10-24")\`. Use the provided 'Latest Date' field to inform dates in queries.

Before wrting the mongosh query, think step-by-step about what the query should do in the "queryPlan" field.
For the language field, always put 'mongosh". For example the output should look like: 

${JSON.stringify(abstractOutputExample)}

Always use the '${THINK_TOOL_NAME}' tool before you generate a query with the '${GENERATE_DB_CODE_TOOL_NAME}' tool. If the results seem suboptimal in some way, use the '${THINK_TOOL_NAME}' tool to plan a new query accordingly. Repeat as necessary.
YOU MUST ALWAYS use the '${GENERATE_DB_CODE_TOOL_NAME}' tool to generate a query before completing.
ALWAYS make AT LEAST 2 tool calls, at least one to '${THINK_TOOL_NAME}' and '${GENERATE_DB_CODE_TOOL_NAME}' before responding to the user.
When you are satisfied with the results of '${GENERATE_DB_CODE_TOOL_NAME}', simply say 'Done'`;

export interface GenerateMongoshCodeAgenticParams {
  databaseName: string;
  uri: string;
  databaseInfo: DatabaseInfo;
  nlQuery: NaturalLanguageQuery;
  openai: OpenAIProvider;
  llmOptions: LlmOptions;
}

export async function generateMongoshCodeAgentic({
  databaseName,
  uri,
  databaseInfo,
  nlQuery,
  openai,
  llmOptions,
}: GenerateMongoshCodeAgenticParams) {
  let latestExecution:
    | Awaited<ReturnType<typeof executeMongoshQuery>>["result"]
    | null = null;
  let latestCode: DatabaseCode | null = null;

  const res = await generateText({
    temperature: llmOptions.temperature ?? undefined,
    seed: llmOptions.seed ?? undefined,
    maxTokens:
      llmOptions.max_tokens ?? llmOptions.max_completion_tokens ?? undefined,
    model: openai(llmOptions.model, {
      structuredOutputs: true,
    }),
    tools: {
      [THINK_TOOL_NAME]: tool({
        description:
          "Think about the query plan given the NL query and any previous results (if present). Plan the next query accordingly.",
        parameters: z.object({
          thoughts: z
            .string()
            .describe("Your thoughts and plan for the next query"),
        }),
        execute: async () => {
          return "Ok, now generate the query or think more.";
        },
      }),
      [GENERATE_DB_CODE_TOOL_NAME]: tool({
        description:
          "A MongoDB Shell (mongosh) query for the database use case",
        parameters: DatabaseCodeSchema,
        execute: async (args) => {
          const execution = await executeMongoshQuery({
            databaseName,
            query: args.code,
            uri,
          });
          latestExecution = execution;
          latestCode = args;
          return {
            ...execution,
            result: truncateDbOperationOutputForLlm(execution.result),
          };
        },
      }),
    },
    maxSteps: 10,
    messages: [
      {
        role: "system",
        content: nlQuerySystemPrompt,
      },
      {
        role: "user",
        content: `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${makePromptDbInfo(databaseInfo)}

${makePromptNaturalLanguageQueryInfo(nlQuery)}
`,
      },
    ],
  });
  if (!latestExecution) {
    throw new Error("latestExecution is null");
  }
  if (!latestCode) {
    throw new Error("latestCode is null");
  }
  return {
    ...(latestExecution as DatabaseExecutionResult),
    ...(latestCode as DatabaseCode),
  };
}

export interface GenerateMongoShParams {
  dbInfo: {
    name: string;
    uri: string;
  };
  nlQueryNode: DatabaseNlQueryNode;
  openai: OpenAIProvider;
  llmOptions: LlmOptions;
}
export async function generateMongoshCode({
  dbInfo,
  nlQueryNode,
  openai,
  llmOptions,
}: GenerateMongoShParams): Promise<DatabaseCodeNode> {
  const { name, uri } = dbInfo;
  const { data: nlQuery } = nlQueryNode;
  const response = await generateMongoshCodeAgentic({
    databaseName: name,
    uri,
    databaseInfo: nlQueryNode.parent.parent.parent.data,
    nlQuery,
    openai,
    llmOptions,
  });
  const metadata = {
    queryOperators: extractMongoDbQueryOperators(response.code),
    methods: extractMongoDbMethods(response.code),
  };

  // Create and return the DatabaseCodeNode with the result
  return {
    _id: new ObjectId(),
    type: "database_code",
    data: { ...response, ...metadata },
    parent: nlQueryNode,
    updated: new Date(),
  } as DatabaseCodeNode;
}

const foo = makeGenerateNChoiceChildrenWithOpenAi<
  DatabaseNlQueryNode,
  DatabaseCodeNode
>({
  childType: "database_code",
  makePromptMessages: async ({
    data: naturalLanguageQuery,
    parent: {
      parent: {
        parent: { data: databaseInfo },
      },
    },
  }) => {
    const message = `Generate MongoDB Shell (mongosh) queries for the following database and natural language query:

${makePromptDbInfo(databaseInfo)}

  ${makePromptNaturalLanguageQueryInfo(naturalLanguageQuery)}
`;

    return [
      { role: "system", content: nlQuerySystemPrompt },
      { role: "user", content: message },
    ];
  },
  response: {
    schema: DatabaseCodeSchema,
    name: "generate_db_code",
    description: "A MongoDB Shell (mongosh) query for the database use case",
  },
});
