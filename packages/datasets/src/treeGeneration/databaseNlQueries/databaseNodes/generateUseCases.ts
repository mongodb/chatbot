import { makeGenerateChildrenWithOpenAi } from "../../generateChildren";
import {
  DatabaseUseCaseSchema,
  DatabaseUserNode,
  UseCaseNode,
} from "./nodeTypes";
import { makePromptDbInfo, makePromptDbUserInfo } from "./makePromptComponents";
import { wrapTraced } from "mongodb-rag-core/braintrust";
import { makeOpenAiClient } from "../../../openAi";

export const generateDatabaseUseCases = wrapTraced(
  makeGenerateChildrenWithOpenAi<DatabaseUserNode, UseCaseNode>({
    openAiClient: makeOpenAiClient(),
    makePromptMessages: async (
      { data: user, parent: { data: databaseInfo } },
      numMessages
    ) => {
      const systemPrompt = `You are an expert user researcher who understands how different professionals use database information in their roles. Given a database user profile, generate realistic use cases that describe what information they need to retrieve from a database and why.

For each use case:
- Focus ONLY on information needs, not on specific queries or technical implementation
- Consider the user's job title, department, expertise, and experience level
- Create detailed scenarios that reflect real-world information needs they would have
- Emphasize the business context and purpose behind each information need
- Include a mixture of routine and specialized requirements using different aspects of the database. Such as but not limited to:
  - Reporting on time periods
  - Summarizing metrics across categories
  - Finding specific records that meet multiple criteria
  - Combining related data from different collections
  - Searching for text patterns
  - Analyzing trends over time
  - Identifying geographic patterns
  - Extracting subsets of data fields
  - Ranking and limiting results
  - ...etc.
- Consider both routine information needs and occasional specialized requirements
- Include a balance of "simple", "moderate", and "complex" use cases, as appropriate for a given user. Some users may have different balances, depending on their role.
- ONLY make use cases that are supported by information in the given database.

Generate ${numMessages} use case(s).`;
      const message = `Generate information retrieval use cases for the following user:
    
${makePromptDbUserInfo(user)}

For a database with the following information:

${makePromptDbInfo(databaseInfo)}

Based on this profile, what are the most realistic and specific information needs this person would have when working with the database?`;

      return [
        { role: "system", content: systemPrompt },
        { role: "user", content: message },
      ];
    },
    response: {
      schema: DatabaseUseCaseSchema,
      name: "generate_use_cases",
      description: "An array of information retrieval use cases for the user",
    },
    childType: "database_use_case",
  }),
  {
    name: "generateDatabaseUseCases",
  }
);
