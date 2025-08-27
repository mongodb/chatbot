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
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { makeOpenAiClient } from "../../../openAi";

const abstractOutputExample: DatabaseCode = {
  queryPlan: "<query plan here>",
  code: "<EJSON-formatted aggregation pipeline code here>",
  language: "json",
};

const nlQuerySystemPrompt = `You are an expert data analyst experienced at using MongoDB and MongoDB Atlas Search.
Your job is to take information about a MongoDB database plus a natural language query and generate an aggregation pipeline to execute to retrieve the information needed to answer the natural language query. The query *must* use Atlas Search via the \`$search\` operator.

In your response include a query plan, where you think step-by-step about how to best execute the query before providing the final aggregation pipeline output.

<format>
Format the aggregation pipeline as an array of aggregation pipeline stages to insert into a query like \`db.<collection name>.aggregate({/* query using '$search' */})\`.

<formatting-requirements>
1. Always include the "index" name in the query.
2. The query results MUST include the \`_id\` field for each document returned. This is incredibly important.
3. Project out the \`text\` field as it is very large and not needed for the query ({"$project": { "text": 0  /* ...other fields here */ }}).
4. You MUST NOT include any comments in the output code. It MUST be valid EJSON that can be interpreted by JSON operators like \`JSON.parse()\`.
</formatting-requirements>

For example, the output should look like:
\`\`\`json
[
  { "$search": { "index": "<index name here>", /* search stage here */ } },
  { /* other stages here */ },
  // Note again that the _id field MUST be included in the projection stage.
  { "$project": { "_id": 1, "text": 0, ...other fields here } }
]
\`\`\`

<mongodb-extended-json-format>
The output should be in MongoDB Extended JSON format if you need to use any non-JSON types.

Use MongoDB Extended JSON format for BSON types:
- ObjectId: \`{"$oid": "507f1f77bcf86cd799439011"}\`
- Date: \`{"$date": "2015-02-23T23:19:54.674Z"}\` or \`{"$date": {"$numberLong": "1423872000000"}}\`
- Regex: \`{"$regex": "pattern", "$options": "flags"}\`
- NumberLong: \`{"$numberLong": "123456789"}\`
- NumberDecimal: \`{"$numberDecimal": "123.45"}\`

Examples:
\`\`\`json
// ObjectId field
{ "_id": { "$oid": "507f1f77bcf86cd799439011" } }

// Date range query
{
  "publishedDate": {
    "$gte": { "$date": "2023-01-01T00:00:00.000Z" },
    "$lt": { "$date": "2024-01-01T00:00:00.000Z" }
  }
}
\`\`\`
</mongodb-extended-json-format>
</format>

<query-authoring-tips>
Some general query-authoring tips:

${markdownList([
  'Always include the "index" name in the query',
  "Always use the $search stage as the first stage in the aggregation pipeline, followed by other stages as needed",
  "Use the `compound` operator to combine multiple search conditions with `must`, `should`, and `filter` clauses appropriately",
  "Place non-scoring operators (`equals`, `range`, `exists`) in `filter` clause to optimize performance and avoid unnecessary scoring",
  "Use `must` clause for required conditions that should affect scoring, should clause for preferred conditions, and `filter` for required conditions that shouldn't affect scoring",
  "Leverage text search with appropriate analyzers - use text operator for full-text search, phrase for exact matches, autocomplete for type-ahead",
  "Apply scoring and boosting strategically - use boost option to increase importance of certain fields or conditions",
  "Include proper field specifications in your operators - specify which indexed fields to search against",
  "Use limit and sort stages after $search to manage result sets, but avoid blocking operations when possible",
  "For complex text matching, consider wildcard or regex operators but note they are resource-intensive",
  "Utilize stored source fields when you need specific fields in subsequent pipeline stages to avoid full document lookup",
  "When using autocomplete, configure appropriate minGrams and maxGrams values (typically maxGrams of 10 for English)",
  "Consider using $searchMeta for metadata queries (counts, facets) when you don't need the actual documents",
])}
</query-authoring-tips>

<query-anti-patterns>

Some Atlas Search query anti-patterns to avoid:

${markdownList([
  "Avoid using the $search aggregation stage followed by $sort, $group, $count, $match stages. Instead, prefer to use the $search native features such $search.sort (instead of $sort), $search.facet (instead of $group), $search.count (instead of $count), $search.compound.filter (instead of $match).",
  "Avoid using $search.regex operator. It can be very inefficient. Instead, prefer using wildcard, autocomplete, and custom analyzers when possible.",
  'Avoid using MongoDB range queries for pagination. Instead use the $search.searchBefore and $search.searchAfter operators with the searchSequenceToken provided by $meta. E.g. { paginationToken : { $meta : "searchSequenceToken" } }',
])}

</query-anti-patterns>

<query-plan>
Before writing the aggregation pipeline, think step-by-step about what the query should do in the "queryPlan" field. In your thoughts consider:

${markdownList([
  "Which collections have Atlas Search indexes and the index name to use",
  "which indexed fields are relevant for the search query",
  "What type of search operation to use (text search, autocomplete, phrase matching, wildcard, regex, etc.)",
  "Whether to use compound operator and which clauses (must, should, filter) are appropriate for each condition",
  "What search terms, phrases, or patterns need to be matched and against which indexed fields",
  "How to structure scoring and boosting - which conditions should affect relevance scoring vs filtering only",
  "What additional pipeline stages are needed after $search (sorting, limiting, projecting, grouping, etc.)",
  "Whether to use $search or $searchMeta stage (documents vs metadata like counts/facets)",
  "How to handle text analysis - which analyzers are configured for the indexed fields",
  "Performance considerations - avoiding resource-intensive operators like complex regex or wildcard when possible",
  "Whether stored source fields are available and should be used to optimize subsequent pipeline stages",
  "Any specific search features needed like fuzzy matching, synonyms, or proximity searches",
  "How to structure the query for optimal search index utilization and minimal blocking operations",
  "In the query plan you can include comments to help you think through the query, but you MUST NOT include any comments in the output 'code' field. (Again, the output code MUST be valid EJSON that can be interpreted by JSON operators like `JSON.parse()`.)",
])}</query-plan>

<language>
For the language field, always put '${abstractOutputExample.language}'. 
</language>

<abstract-output-example>
For example the output should look like: 
${JSON.stringify(abstractOutputExample)}
</abstract-output-example>`;

function markdownList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}
export const generateAtlasSearchCode = wrapTraced(
  makeGenerateNChoiceChildrenWithOpenAi<DatabaseNlQueryNode, DatabaseCodeNode>({
    openAiClient: makeOpenAiClient(),
    childType: "database_code",
    makePromptMessages: async ({
      data: naturalLanguageQuery,
      parent: {
        parent: {
          parent: { data: databaseInfo },
        },
      },
    }) => {
      const message = `Generate aggregation pipeline for the following database and natural language query:

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
      description: "An aggregation pipeline for the database use case",
    },
  }),
  {
    name: "generateAtlasSearchCode",
  }
);
