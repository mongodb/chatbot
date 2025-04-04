import { makeGenerateChildrenWithOpenAi } from "../../generateChildren";
import {
  DatabaseNlQueryNode,
  DatabaseUseCase,
  DatabaseUser,
  NaturalLanguageQuerySchema,
  UseCaseNode,
} from "./nodeTypes";
import {
  makePromptDbInfo,
  makePromptDbUserInfo,
  makePromptUseCaseInfo,
} from "./makePromptComponents";
import { DatabaseInfo } from "mongodb-rag-core/executeCode";
import { OpenAI } from "mongodb-rag-core/openai";

export interface MakeGenerateNaturalLanguageQueryPromptParams {
  numChildren: number;
  useCase: DatabaseUseCase;
  user: DatabaseUser;
  databaseInfo: DatabaseInfo;
}
export function makeGenerateNaturalLanguageQueryPrompt({
  numChildren,
  useCase,
  user,
  databaseInfo,
}: MakeGenerateNaturalLanguageQueryPromptParams): OpenAI.ChatCompletionMessageParam[] {
  const systemMessage = `You are an expert in natural language processing and database query understanding. Given a database use case, generate realistic natural language queries that a user might ask to fulfill their information needs.

These queries will be used in a benchmarking dataset that measures large language models' ability to generate MongoDB database queries from natural language. The queries should be of similar type to those used in modern natural language-to-SQL benchmarks like Spider-SQL or BirdBench.

It is important that the natural language queries not be overly vague, such that there is a high degree of ambiguity in the query. For each natural language query, there should be a clear, unambiguous intent. This is so we can measure the accuracy of the generated queries against the intent and a reference answer. 

Be sure to include varying levels of complexity among the queries.

For each natural language query:
- Create a query that sounds natural and conversational, as if a real user was asking it
- Make sure the query aligns with the user's intent and information needs described in the use case
- Consider the complexity level of the use case when crafting the query
- Include specific entities relevant to the database domain (movie titles, actor names, etc.) where appropriate
- Provide variations that express the same information need in different ways
- Ensure the query would retrieve the information needed to satisfy the use case
- The query should sound conversational, as if the user were asking them to an AI chatbot.

Limiting queries: 
- IMPORTANT: Design queries that will return a specific small number of results (ideally fewer than 20 documents). 
  - For example, instead of saying "Find the most popular movies from 1997", say "Find 10 most popular movies from 1997"
- Include specific filtering conditions and constraints to narrow down the result set
- Avoid overly broad queries that might return the entire collection or a large subset of it

To create more specific queries:
- Use multiple filtering conditions when appropriate
  - For example, "Find total number of action movies from 2010 with a rating above 8.5"
- Include specific values for fields (exact names, precise dates, specific ratings, etc.)
- Use comparisons and ranges with specific thresholds

If the use case relates to time windows or temporal analysis:
- Include a variety of different time expressions (last 30 days, year 1998, past quarter, last summer, etc.)
- Mix absolute time references (e.g., "in 2020", "during the 1990s") with relative ones (e.g., "in the past month", "over the last year")
- Include some queries with multiple time constraints when appropriate (e.g., "movies released between 2010 and 2020")
- Use both specific dates and general time periods 
- Make sure to keep the date provided in the 'Latest Date' field in mind when crafting the query.

Make use of the indexes available in the database when designing the query, if relevant to the use case.
For example if there are geo or text based indexes, consider writing queries that use them. However, only do this if relevant to the use case.

For the output \`resultsSchema\`, include the actual type definition, for instance given the query "Find the titles and ratings of the 10 most popular movies from 2010 with a rating above 8.5", the output should be:
\`\`\`typescript
/**
 * Title and rating of movies
 */
type QueryResults = {title: string, rating: number}[];
\`\`\`

Generate ${numChildren} natural language queries with multiple variations for each use case, maintaining the same complexity level as specified in the use case.`;

  const message = `Generate natural language queries for the following database use case:

${makePromptUseCaseInfo(useCase)}

${makePromptDbUserInfo(user)}

${makePromptDbInfo(databaseInfo)}`;

  return [
    { role: "system", content: systemMessage },
    { role: "user", content: message },
  ];
}
export const nlQueryResponseSchema = {
  schema: NaturalLanguageQuerySchema,
  name: "generate_nl_query",
  description: "A natural language query for the database use case",
};

export const generateNaturalLanguageQueries = makeGenerateChildrenWithOpenAi<
  UseCaseNode,
  DatabaseNlQueryNode
>({
  makePromptMessages: async (
    {
      data: useCase,
      parent: {
        data: user,
        parent: { data: databaseInfo },
      },
    },
    numChildren
  ) => {
    return makeGenerateNaturalLanguageQueryPrompt({
      numChildren,
      useCase,
      user,
      databaseInfo,
    });
  },
  response: nlQueryResponseSchema,
});
