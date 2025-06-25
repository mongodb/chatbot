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
import { openAiClient } from "../../../openAi";

const abstractOutputExample: DatabaseCode = {
  queryPlan: "<query plan here>",
  code: "<mongosh code here>",
  language: "mongosh",
};

// Taken from the optimized mongosh query authoring prompt
export const mongoshQueryAuthoringTips = [
  "Ensure proper use of MongoDB operators ($eq, $gt, $lt, etc.) and data types (ObjectId, ISODate)",
  "For complex queries, use aggregation pipeline with proper stages ($match, $group, $lookup, etc.)",
  "Consider performance by utilizing available indexes, avoiding $where and full collection scans, and using covered queries where possible",
  "Include sorting (.sort()) and limiting (.limit()) when appropriate for result set management",
  "Handle null values and existence checks explicitly with $exists and $type operators to differentiate between missing fields, null values, and empty arrays",
  "Do not include `null` in results objects in aggregation, e.g. do not include _id: null",
  "For date operations, NEVER use an empty new date object (e.g. `new Date()`). ALWAYS specify the date, such as `new Date(\"2024-10-24\")`. Use the provided 'Latest Date' field to inform dates in queries.",
  "For Decimal128 operations, prefer range queries over exact equality",
  "When querying arrays, use appropriate operators like $elemMatch for complex matching, $all to match multiple elements, or $size for array length checks",
];

// Taken from the optimized mongosh query authoring prompt
const chainOfThoughtTopics = [
  "Which collections are relevant to the query.",
  "Which query operation to use (find vs aggregate) and what specific operators ($match, $group, $project, etc.) are needed",
  "What fields are relevant to the query.",
  "Which indexes you can use to improve performance.",
  "Any specific transformations or projections.",
  "What data types are involved and how to handle them appropriately (ObjectId, Decimal128, Date, etc.)",
  "What edge cases to consider (empty results, null values, missing fields)",
  "How to handle any array fields that require special operators ($elemMatch, $all, $size)",
  "Any other relevant considerations.",
];
const nlQuerySystemPrompt = `You are an expert data analyst experienced at using MongoDB.
Your job is to take information about a MongoDB database plus a natural language query and generate a MongoDB shell (mongosh) query to execute to retrieve the information needed to answer the natural language query.

In your response include a query plan, where you think step-by-step about how to best execute the query before providing the final mongosh output.

<format>
Format the mongosh query in the following structure:

\`db.<collection name>.find({/* query */})\` or \`db.<collection name>.aggregate({/* query */})\`
</format>

<query-authoring-tips>
Some general query-authoring tips:

${markdownList(mongoshQueryAuthoringTips)}
</query-authoring-tips>

<query-plan>
Before writing the mongosh query, think step-by-step about what the query should do in the "queryPlan" field. In your thoughts consider:

${markdownList(chainOfThoughtTopics)}
</query-plan>

<language>
For the language field, always put 'mongosh'. 
</language>

<abstract-output-example>
For example the output should look like: 
${JSON.stringify(abstractOutputExample)}
</abstract-output-example>`;
function markdownList(items: string[]) {
  return items.map((item, index) => `${index + 1}. ${item}`).join("\n");
}
export const generateMongoshCode = wrapTraced(
  makeGenerateNChoiceChildrenWithOpenAi<DatabaseNlQueryNode, DatabaseCodeNode>({
    openAiClient,
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
  }),
  {
    name: "generateMongoshCode",
  }
);
