import "dotenv/config";
import { z } from "zod";
import { makeGenerateChildrenWithOpenAi } from "../generateChildren";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import {
  DatabaseNlQueryNode,
  DatabaseCodeNode,
  DatabaseCodeSchema,
} from "./nodeTypes";
import {
  makePromptDbInfo,
  makePromptNaturalLanguageQueryInfo,
} from "./makePromptComponents";

const nlQuerySystemPrompt = `You are an expert data analyst experienced at using MongoDB.
Your job is to take information about a MongoDB database plus a natural language query and generate a MongoDB shell (mongosh) query to execute to retrieve the information needed to answer the natural language query.

In your response include a query plan, where you think step-by-step about how to best execute the query before providing the final mongosh output.

Format the mongosh query in the following structure:
1. TODO:....add some guidelines`;

export const generateDbCode = makeGenerateChildrenWithOpenAi<
  DatabaseNlQueryNode,
  DatabaseCodeNode
>({
  openAiClient: new AzureOpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
    endpoint: process.env.OPENAI_ENDPOINT!,
    apiVersion: process.env.OPENAI_API_VERSION!,
  }),
  clientConfig: {
    model: "gpt-4o",
    temperature: 0.6,
    seed: 42,
  },
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
    schema: z.array(DatabaseCodeSchema),
    name: "generate_db_code",
    description: "A MongoDB Shell (mongosh) query for the database use case",
  },
});
