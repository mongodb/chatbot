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

const abstractOutputExample: DatabaseCode = {
  queryPlan: "<query plan here>",
  code: "<mongosh code here>",
  language: "mongosh",
};

const nlQuerySystemPrompt = `You are an expert data analyst experienced at using MongoDB.
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
`;

export const generateMongoshCode = makeGenerateNChoiceChildrenWithOpenAi<
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
