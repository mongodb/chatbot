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
import { makeOpenAiClient } from "../../../openAi";

export interface MakeGenerateNaturalLanguageQueryPromptParams {
  numChildren: number;
  useCase: DatabaseUseCase;
  user: DatabaseUser;
  databaseInfo: DatabaseInfo;
  queryType?: "mql" | "atlas_search";
}

const baseSystemMessage = `You are an expert in natural language processing and database query understanding. Given a database use case, generate realistic natural language queries that a user might ask to fulfill their information needs.

These queries will be used in a benchmarking dataset that measures large language models' ability to generate MongoDB database queries from natural language. The queries should be of similar type to those used in modern natural language-to-SQL benchmarks like Spider-SQL or BirdBench.

<general_guidelines>
For each natural language query:
- Create a query that sounds natural and conversational, as if a real user was asking it
- Make sure the query aligns with the user's intent and information needs described in the use case
- Consider the complexity level of the use case when crafting the query
- Include specific entities relevant to the database domain (movie titles, actor names, etc.) where appropriate
- Ensure the query would retrieve the information needed to satisfy the use case
- The query should sound conversational, as if the user were asking them to an AI chatbot.
- For most users, avoid using technical database terminology (e.g., "documents", "collections") - use domain-specific terms instead
</general_guidelines>`;

const temporalGuidelines = `<temporal_guidelines>
If the use case relates to time windows or temporal analysis:
- Include a variety of different time expressions (last 30 days, year 1998, past quarter, last summer, etc.)
- Mix absolute time references (e.g., "in 2020", "during the 1990s") with relative ones (e.g., "in the past month", "over the last year")
- Include some queries with multiple time constraints when appropriate (e.g., "movies released between 2010 and 2020")
- Use both specific dates and general time periods 
- Make sure to keep the date provided in the 'Latest Date' field in mind when crafting the query.

Note: not all databases will have temporal data. If the database does not have temporal data, ignore the temporal guidelines.
</temporal_guidelines>`;

const indexGuidelines = `<index_guidelines>
- Make use of the indexes available in the database when designing the query, if relevant to the use case.
- For example if there are geo or text based indexes, consider writing queries that use them. However, only use the indexes if relevant to the use case.
</index_guidelines>`;

const resultsSchemaGuidelines = `<results_schema_guidelines>
For the output \`resultsSchema\`, include the actual type definition, for instance given the query "Find the titles and ratings of the 10 most popular movies from 2010 with a rating above 8.5", the output should be:
\`\`\`typescript
/**
 * Title and rating of movies
 */
type QueryResults = {title: string, rating: number}[];
\`\`\`
</results_schema_guidelines>`;

const outputGuidelines = (numChildren: number) => `<output_guidelines>
Generate ${numChildren} natural language queries with multiple variations for each use case, maintaining the same complexity level as specified in the use case.
</output_guidelines>`;

const makeMqlSystemMessage = (numChildren: number) => `${baseSystemMessage}

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

${temporalGuidelines}

${indexGuidelines}

${resultsSchemaGuidelines}

${outputGuidelines(numChildren)}`;

const makeAtlasSearchSystemMessage = (
  numChildren: number,
) => `${baseSystemMessage}

<query_specificity_guidelines>
Regarding the specificity of the natural language queries for Atlas Search:
- Focus on text search capabilities and full-text search scenarios that Atlas Search excels at
- Include queries that would benefit from search relevance scoring and ranking
- Create queries that leverage specific Atlas Search features like autocomplete, phrase matching, fuzzy search, and compound operations
- Specify search terms that would work well with text analyzers (stemming, synonyms, etc.)
- Consider Atlas Search index structure and which fields are available for search operations
- Include queries that demonstrate proper compound query structuring with must, should, and filter clauses

To create more specific Atlas Search queries:
- Use specific search terms and phrases for full-text search with field targeting
  - For example, "Find the top 5 articles containing both 'MongoDB' and 'performance' in the title or content"
- Include autocomplete/type-ahead scenarios with partial terms and appropriate limits
  - For example, "Show 10 autocomplete suggestions for articles starting with 'databas'"
- Specify phrase searches for exact matches with proper field constraints
  - For example, "Find documents containing the exact phrase 'MongoDB Atlas' in title or content"
- Use fuzzy matching scenarios with approximate terms and edit distance considerations
  - For example, "Search for articles about 'databse' (misspelled database) with fuzzy matching"
- Include queries that benefit from text analysis features like stemming and synonym expansion
  - For example, "Find articles about 'running' that should also match 'run', 'runs', 'ran'"
- Demonstrate compound query logic with boolean operations
  - For example, "Find articles that MUST contain 'database' in title AND SHOULD contain 'optimization' in content, but must NOT contain 'deprecated'"
- Include scoring and boosting scenarios for relevance tuning
  - For example, "Search for 'machine learning' articles, boosting results where the author is in preferred categories"
- Use range queries for dates, numbers, or other indexed numeric fields when available
  - For example, "Find articles about 'AI' published in the last 6 months, ranked by relevance"
- Include wildcard and regex patterns (but note performance considerations)
  - For example, "Find articles with titles matching pattern 'data*' or content matching regex for technical terms"
- Leverage moreLikeThis functionality for similarity searches
  - For example, "Find articles similar to the content of a specific document about microservices"

</query_specificity_guidelines>

<atlas_search_capabilities>
When creating natural language queries for Atlas Search, consider these Atlas Search capabilities and best practices:

<search_operators_reference>
Atlas Search provides these key operators that should influence natural language query design:
- text: Full-text search with stemming and analysis - use for general text searches
- phrase: Exact phrase matching - use when exact word sequences matter
- autocomplete: Type-ahead functionality - use for search suggestions and prefix matching
- wildcard: Pattern matching - use sparingly for performance, good for pattern-based searches
- regex: Regular expression matching - use carefully due to performance impact
- compound: Boolean logic combination - use for complex multi-condition searches
- exists: Field presence checking - use when field existence matters
- range: Numeric/date ranges - use for filtering by numeric or temporal constraints
- moreLikeThis: Similarity searches - use for finding related documents
</search_operators_reference>

<compound_query_design>
Effective compound query structure for natural language design:
- must: Required conditions that affect relevance scoring - use for essential search criteria
- should: Optional conditions that boost relevance - use for preferred but not required criteria  
- filter: Required conditions that don't affect scoring - use for efficient filtering
- mustNot: Exclusion conditions - use for removing unwanted results
- These can be nested and combined for sophisticated search logic
</compound_query_design>

<performance_and_scoring_considerations>
Natural language queries should consider these Atlas Search performance and scoring factors:
- Place non-scoring filters in 'filter' clauses for better performance
- Use field-specific search when possible rather than searching all fields
- Consider boosting strategies: field-level boosts, recency boosts, popularity boosts
- Leverage stored source fields when available to optimize pipeline performance
- Design queries that naturally limit result sets through specificity and constraints
- Consider text analyzer implications: stemming, synonyms, language-specific analysis
</performance_and_scoring_considerations>

<search_context_scenarios>
Create natural language queries that fit these Atlas Search scenarios with diverse intent types:

<scenario_content_scenario type="discovery">
**Discovery & Exploration Intents:**
- Full-text content search with relevance ranking
- Similarity search for content recommendation and "find more like this"
- Exploratory queries that discover patterns or relationships in content

</scenario_content_scenario>

<scenario_content_scenario type="analysis">
**Analysis & Comparison Intents:**
- Trend analysis combining text search with temporal constraints
- Comparative searches between different content categories or time periods  
- Content gap analysis (find topics that are missing or underrepresented)
- Performance analysis of content by engagement or relevance metrics

</scenario_content_scenario>

<scenario_content_scenario type="aggregation">

**Aggregation & Summary Intents:**
- Statistical queries combining search with count/sum/average operations
- Content classification and categorization through search patterns
- Distribution analysis of search results across different dimensions
- Summary generation from search result sets

</scenario_content_scenario>

<scenario_content_scenario type="validation">

**Validation & Quality Control Intents:**
- Content quality assessment through specific search criteria
- Duplicate or similar content detection
- Completeness checking (find content missing key information)
- Accuracy validation through cross-referencing searches

</scenario_content_scenario>

<scenario_content_scenario type="ui">

**User Interface & Interactive Intents:**
- Autocomplete and search suggestions for user interfaces
- Faceted search with multiple filter dimensions and drill-down capabilities
- Progressive search refinement with iterative filtering
- Context-aware search based on user behavior patterns

</scenario_content_scenario>

<scenario_content_scenario type="technical">

**Technical & Advanced Search Intents:**
- Hybrid search combining text relevance with other factors (date, popularity, etc.)
- Multi-field search with different field importance weights
- Fuzzy matching for handling user input errors and variations
- Proximity searches where term relationships matter
- Complex Boolean logic for precise content retrieval

</scenario_content_scenario>

</search_context_scenarios>
</atlas_search_capabilities>

<query_complexity_guidelines>
Be sure to include varying levels of complexity among the Atlas Search queries. The complexity levels are:

- simple
- moderate
- complex

Below is some specific guidance for each complexity level:

<simple_queries>
Simple Atlas Search queries should follow these criteria:

Requirements:
- Single search operator (text, autocomplete, phrase, etc.)
- Basic text search functionality

Guidelines:
- Use basic text search with simple terms
- Single field searches
- Autocomplete with straightforward prefixes
- Exact phrase matches
- Basic wildcard or regex patterns

Examples:
- "Find articles with the word 'database' in the title"
- "Show autocomplete suggestions for 'mong'"
- "Search for the exact phrase 'getting started'"
- "Find documents containing 'tutorial'"

</simple_queries>

<moderate_queries>
Moderate Atlas Search queries should follow these criteria:

Requirements:
- Multiple search conditions combined with compound operator
- 2-4 search criteria using Atlas Search features

Guidelines:
- Combine multiple operators (text + autocomplete, phrase + wildcard)
- Search across multiple fields
- Use scoring and boosting
- Include fuzzy matching or synonyms
- Basic faceting or filtering

Examples:
- "Find articles containing 'MongoDB' in title and 'performance' in content, ranked by relevance"
- "Search for articles with 'database' in title or starting with 'NoSQL' autocomplete"
- "Find documents with exact phrase 'Atlas Search' and fuzzy match for 'indexs' (misspelled)"
- "Search articles by author 'John' and containing words similar to 'optimization'"

</moderate_queries>

<complex_queries>
Complex Atlas Search queries should follow these criteria:

Requirements:
- Multiple compound search operations
- Advanced Atlas Search features and operators
- Complex scoring and ranking requirements
- Multiple search contexts or conditions

Guidelines:
- Complex compound queries with must, should, mustNot clauses
- Advanced operators like span, moreLikeThis, or complex regex
- Multiple faceting dimensions
- Geospatial search combined with text search
- Time-based relevance with text search
- Cross-field analysis and scoring

Examples:
- "Find articles similar to a given document about machine learning that MUST contain 'neural networks' or 'deep learning' in the title, SHOULD contain 'TensorFlow' or 'PyTorch' in content with different boost values, were published in the last 6 months, have high engagement metrics, and exclude articles tagged 'deprecated' or 'outdated'"
- "Search for documents where 'MongoDB' and 'Atlas' appear within 5 words of each other in content, boost results containing 'tutorial' or 'guide' in title with field-specific weights, filter by publication date range, and include faceting by author and category with custom scoring based on view count"
- "Find articles with compound logic: autocomplete suggestions for 'data' in title, fuzzy match for 'analytics' (misspelled as 'analitycs') in content with edit distance of 2, proximity search for 'visualization' and 'charts' within 10 words, exclude beta content, boost results from verified authors, and apply hybrid scoring combining text relevance with social engagement metrics"
- "Search for technical documentation that MUST contain exact phrase 'API authentication' in title, SHOULD have any of ['OAuth', 'JWT', 'tokens'] in content with increasing boost values, include fuzzy matching for common misspellings, filter by recent updates within 1 year, and use moreLikeThis to find related security documentation"

</complex_queries>

<query_complexity_distribution_guidelines>
- When generating the natural language queries, skew toward higher complexity levels to create challenging benchmarks that properly test advanced Atlas Search capabilities.
- Target distribution: ~10-15% simple queries, ~25-30% moderate queries, ~55-65% complex queries
- Prioritize complex queries that combine multiple advanced Atlas Search features and require sophisticated query planning
- Focus on search-specific functionality rather than general database operations.
- Complex queries should push the boundaries of what's possible with Atlas Search compound operators, advanced scoring, and multi-dimensional search logic.
</query_complexity_distribution_guidelines>

</query_complexity_guidelines>

<query_limiting_guidelines>
Limiting Atlas Search queries: 
- IMPORTANT: Design queries that will return a specific small number of results (ideally fewer than 20 documents), as search results are typically paginated and ranked by relevance.
  - For example, instead of saying "Find articles about MongoDB", say "Find the top 10 most relevant articles about MongoDB"
- Include specific search constraints and filters to narrow down the result set
- Use relevance ranking and scoring to limit to most relevant results
- Leverage Atlas Search's natural ranking capabilities by requesting "top N" or "most relevant" results
- Include specific field constraints when possible (e.g., search in title vs. content vs. both)
</query_limiting_guidelines>

${temporalGuidelines}

${indexGuidelines}

<results_schema_guidelines>
For the output \`resultsSchema\`, include the actual type definition.

Rules:
1. In the type definition, ALWAYS include the \`_id\`  and \`id\` fields.
2. NEVER include the \`text\` field.
3. The natural language query should correspond to returning a list of articles (max 15 articles).
4. The natural language query MUST NOT correspond to an aggregation query that would materialize a single value, like a count or average.

for instance given the query "find me articles about the history of the internet", the output should be:
\`\`\`typescript
/**
 * Articles about the history of the internet
 */
type QueryResults = {_id: ObjectId, id: string, title: string }[];
\`\`\`
</results_schema_guidelines>

${outputGuidelines(numChildren)}`;

export function makeGenerateNaturalLanguageQueryPrompt({
  numChildren,
  useCase,
  user,
  queryType = "mql",
  databaseInfo,
}: MakeGenerateNaturalLanguageQueryPromptParams): OpenAI.ChatCompletionMessageParam[] {
  const message = `Generate natural language queries for the following database use case:

${makePromptUseCaseInfo(useCase)}

${makePromptDbUserInfo(user)}

${makePromptDbInfo(databaseInfo)}`;

  return [
    {
      role: "system",
      content: getSystemMessage(queryType, numChildren),
    },
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
    openAiClient: makeOpenAiClient(),
    makePromptMessages: async (
      {
        data: useCase,
        parent: {
          data: user,
          parent: { data: databaseInfo },
        },
      },
      numChildren,
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
  },
);

export const generateNaturalLanguageAtlasSearchQueries = wrapTraced(
  makeGenerateChildrenWithOpenAi<UseCaseNode, DatabaseNlQueryNode>({
    openAiClient: makeOpenAiClient(),
    makePromptMessages: async (
      {
        data: useCase,
        parent: {
          data: user,
          parent: { data: databaseInfo },
        },
      },
      numChildren,
    ) => {
      return makeGenerateNaturalLanguageQueryPrompt({
        numChildren,
        useCase,
        user,
        databaseInfo,
        queryType: "atlas_search",
      });
    },
    response: nlQueryResponseSchema,
  }),
  {
    name: "generateNaturalLanguageAtlasSearchQueries",
  },
);

function getSystemMessage(
  queryType: Required<MakeGenerateNaturalLanguageQueryPromptParams>["queryType"],
  numChildren: number,
) {
  switch (queryType) {
    case "mql":
      return makeMqlSystemMessage(numChildren);
    case "atlas_search":
      return makeAtlasSearchSystemMessage(numChildren);
  }
}
