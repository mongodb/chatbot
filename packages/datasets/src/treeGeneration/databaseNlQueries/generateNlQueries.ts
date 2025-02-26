import "dotenv/config";
import { z } from "zod";
import { makeGenerateChildrenWithOpenAi } from "../generateTree";
import { AzureOpenAI } from "mongodb-rag-core/openai";
import {
  NaturalLanguageQuery,
  NaturalLanguageQuerySchema,
  UseCaseNode,
} from "./nodeTypes";

const nlQuerySystemPrompt = `You are an expert in natural language processing and database query understanding. Given a database use case, generate realistic natural language queries that a user might ask to fulfill their information needs.

For each natural language query:
- Create a query that sounds natural and conversational, as if a real user was asking it
- Make sure the query aligns with the user's intent and information needs described in the use case
- Consider the complexity level of the use case when crafting the query
- Include specific entities relevant to the database domain (movie titles, actor names, etc.) where appropriate
- Provide variations that express the same information need in different ways
- Ensure the query would retrieve the information needed to satisfy the use case
- The queru should sound conversational, as if the user were asking them to an AI chatbot.


If the use case relates to time windows or temporal analysis:
- Include a variety of different time expressions (last 30 days, year 1998, past quarter, last summer, etc.)
- Mix absolute time references (e.g., "in 2020", "during the 1990s") with relative ones (e.g., "in the past month", "over the last year")
- Include some queries with multiple time constraints when appropriate (e.g., "movies released between 2010 and 2020")
- Use both specific dates and general time periods 

Generate at least 10 natural language queries with 2-3 variations for each use case, maintaining the same complexity level as specified in the use case.`;

export const generateNaturalLanguageQueries = makeGenerateChildrenWithOpenAi<
  UseCaseNode,
  NaturalLanguageQuery
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
    data: useCase,
    parent: {
      data: user,
      parent: { data: databaseInfo },
    },
  }) => {
    const message = `Generate natural language queries for the following database use case:

## Use Case

Use Case Title: ${useCase.title}
Use Case Description: ${useCase.description}
Complexity: ${useCase.complexity}
Frequency: ${useCase.frequency}
Data Needed: ${useCase.dataNeeded.join(", ")}

## User Information

Name: ${user.name}
Job Title: ${user.jobTitle}
Department: ${user.department}
Expertise: ${user.expertise.join(", ")}

## Database Information

Name: ${databaseInfo.name}
Description: ${databaseInfo.description}

### Collections
${databaseInfo.schema
  .map(
    (c) => `#### Collection \`${c.name}\`
Description: ${c.description}
Schema:
${c.schema}`
  )
  .join("\n")}`;

    return [
      { role: "system", content: nlQuerySystemPrompt },
      { role: "user", content: message },
    ];
  },
  response: {
    schema: z.array(NaturalLanguageQuerySchema),
    name: "generate_nl_query",
    description: "A natural language query for the database use case",
  },
});
