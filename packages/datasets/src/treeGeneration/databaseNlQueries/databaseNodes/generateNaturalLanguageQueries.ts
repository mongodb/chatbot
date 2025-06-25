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
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { openAiClient } from "../../../openAi";

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

<general_guidelines>
For each natural language query:
- Create a query that sounds natural and conversational, as if a real user was asking it
- Make sure the query aligns with the user's intent and information needs described in the use case
- Consider the complexity level of the use case when crafting the query
- Include specific entities relevant to the database domain (movie titles, actor names, etc.) where appropriate
- Provide variations that express the same information need in different ways
- Ensure the query would retrieve the information needed to satisfy the use case
- The query should sound conversational, as if the user were asking them to an AI chatbot.
- For most users, avoid using technical database terminology (e.g., "documents", "collections") - use domain-specific terms instead
</general_guidelines>

<query_specificity_guidelines>
Regarding the specificity of the natural language queries:
- It is important that the natural language queries not be overly vague.
- For each natural language query, there should be a clear, unambiguous intent. There should be a low degree of ambiguity in the query. This is so we can measure the accuracy of the generated MongoDB queries against the natural language query and a reference answer, which is the database output. 

To create more specific queries:
- Use multiple filtering conditions when appropriate
  - For example, "Find total number of action movies from 2010 with a rating above 8.5"
- Include specific values for fields (exact names, precise dates, specific ratings, etc.)
- Use comparisons and ranges with specific thresholds
- Avoid wildcards or overly broad terms like "all", "any", "everything" without constraints

</query_specificity_guidelines>

<query_complexity_guidelines>
Be sure to include varying levels of complexity among the queries. The complexity levels are:

- simple
- moderate
- complex

Below is some specific guidance for each complexity level:

<simple_queries>
Simple queries should follow these criteria:

Requirements:
- Single collection queries

Guidelines:
- Basic filtering
- Use up to a few conditions (e.g., equality, comparison)
- Correspond to operations like: find, count, simple aggregation

Examples:
- "Find all movies released in 2020"
- "Show me users with age greater than 25"
- "Get the product with SKU 'ABC123'"
- "Count how many orders were placed today"

</simple_queries>

<moderate_queries>
Moderate queries should follow these criteria:

Requirements:
- Single collection queries with multiple conditions
- Multiple filter conditions (3-5) with AND/OR logic
- Can correspond to find/aggregation/count, etc.

Guidelines:
- Aggregations (count, sum, average, min, max, etc.)
- Sorting and limiting results
- May access nested fields or arrays
- Simple grouping operations

Examples:
- "Find the top 10 highest-rated movies from 2020 that are longer than 2 hours"
- "Show me all orders from last month with their customer details and total amount"
- "Get the average rating for each movie genre in the database"
- "List products that are low in stock (less than 10 units) and have been ordered more than 50 times"

</moderate_queries>

<complex_queries>
Complex queries should follow these criteria:

Requirements:
- The query has many parts (at least 3-4 distinct operations or conditions)
- Requires multiple stages of data transformation or analysis
- Cannot be solved with a simple find() or basic aggregation
- Often involves combining data from multiple sources or performing calculations across grouped data
- May require conditional logic or branching based on data values
- Results depend on intermediate calculations or derived fields

Guidelines:
- Can include multiple collections (joins/lookups)
- Complex aggregation pipelines
- Advanced operations (window functions, array manipulations, text search)
- Multiple grouping levels or conditional aggregations
- Geospatial queries or text search with scoring
- Subqueries or complex conditional logic
- Time-series analysis or running calculations

Examples:
- "Find movies where the lead actor has won an Oscar and appeared in at least 5 other movies rated above 8.0 in our database"
- "Calculate the month-over-month growth rate of sales for each product category in the last year"
- "Find all restaurants within 2km of midtown Manhattan that serve Italian cuisine, are open now, and have an average rating above 4.5 from users who have reviewed more than 10 restaurants"
- "Show me customers who spent more than the average customer spending in their region and have made purchases in at least 3 different categories this year"

</complex_queries>

<query_complexity_distribution_guidelines>
- When generating the natural language queries, ensure a balanced distribution across all complexity levels to properly test the model's capabilities.
-You should generate a similar number of queries for each complexity level.
</query_complexity_distribution_guidelines>

</query_complexity_guidelines>

<query_limiting_guidelines>
Limiting queries: 
- IMPORTANT: Design queries that will return a specific small number of results (ideally fewer than 20 documents). 
  - For example, instead of saying "Find the most popular movies from 1997", say "Find 10 most popular movies from 1997"
- Include specific filtering conditions and constraints to narrow down the result set
- Avoid overly broad queries that might return the entire collection or a large subset of it
</query_limiting_guidelines>

<temporal_guidelines>
If the use case relates to time windows or temporal analysis:
- Include a variety of different time expressions (last 30 days, year 1998, past quarter, last summer, etc.)
- Mix absolute time references (e.g., "in 2020", "during the 1990s") with relative ones (e.g., "in the past month", "over the last year")
- Include some queries with multiple time constraints when appropriate (e.g., "movies released between 2010 and 2020")
- Use both specific dates and general time periods 
- Make sure to keep the date provided in the 'Latest Date' field in mind when crafting the query.

Note: not all databases will have temporal data. If the database does not have temporal data, ignore the temporal guidelines.
</temporal_guidelines>

<index_guidelines>
- Make use of the indexes available in the database when designing the query, if relevant to the use case.
- For example if there are geo or text based indexes, consider writing queries that use them. However, only use the indexes if relevant to the use case.
</index_guidelines>

<results_schema_guidelines>
For the output \`resultsSchema\`, include the actual type definition, for instance given the query "Find the titles and ratings of the 10 most popular movies from 2010 with a rating above 8.5", the output should be:
\`\`\`typescript
/**
 * Title and rating of movies
 */
type QueryResults = {title: string, rating: number}[];
\`\`\`
</results_schema_guidelines>

<output_guidelines>
Generate ${numChildren} natural language queries with multiple variations for each use case, maintaining the same complexity level as specified in the use case.
</output_guidelines>`;

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

export const generateNaturalLanguageQueries = wrapTraced(
  makeGenerateChildrenWithOpenAi<UseCaseNode, DatabaseNlQueryNode>({
    openAiClient,
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
  }),
  {
    name: "generateNaturalLanguageQueries",
  }
);
