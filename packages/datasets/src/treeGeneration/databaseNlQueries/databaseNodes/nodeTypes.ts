import { z } from "zod";
import { GenerationNode, WithParentNode } from "../../GenerationNode";
import {
  DatabaseExecutionResult,
  DatabaseInfo,
} from "mongodb-rag-core/executeCode";

export type DatabaseInfoNode = WithParentNode<
  GenerationNode<DatabaseInfo, "database_info">,
  null
>;

export const DatabaseUserSchema = z.object({
  name: z.string().describe("Full name of the database user"),
  role: z.string().describe("Current professional role or position."),
  description: z
    .string()
    .describe(
      "Background of the user. Consider including years of experience and relevant areas of expertise/interest."
    ),
});

export type DatabaseUser = z.infer<typeof DatabaseUserSchema>;

export type DatabaseUserNode = WithParentNode<
  GenerationNode<DatabaseUser, "database_user">,
  DatabaseInfoNode
>;

// Define the schema for a database use case
export const DatabaseUseCaseSchema = z.object({
  title: z.string().describe("Short title describing the use case"),
  description: z
    .string()
    .describe(
      "Detailed description of what information the user needs and why"
    ),
  dataNeeded: z
    .array(z.string())
    .describe(
      "Types of data or information required for this use case, based on the information available in the database schema."
    ),
});

export type DatabaseUseCase = z.infer<typeof DatabaseUseCaseSchema>;

export type UseCaseNode = WithParentNode<
  GenerationNode<DatabaseUseCase, "database_use_case">,
  DatabaseUserNode
>;

export const NaturalLanguageQuerySchema = z.object({
  intent: z
    .string()
    .describe(
      "The underlying intent or purpose of the query. Include any additional context that might be useful for understanding the query and any relevant database entities."
    ),
  collections: z
    .array(z.string())
    .describe("Key collections that the query is about"),
  complexity: z
    .enum(["simple", "moderate", "complex"])
    .describe("Complexity level of the query."),
  query: z
    .string()
    .describe("The natural language query text that a user might ask"),
  resultsSchema: z.string().describe(`Schema of the shape of the results.
The \`QueryResults\` type should extend \`number | Document | Document[]\`, where \`Document\` is the type of a MongoDB document.
      Formatted in Typescript as such:
\`\`\`typescript
/**
 * <Add a description of the shape of the expected results here.>
 */
type QueryResults =  /* <Add actual type definition of result shape> */
\`\`\``),
});

export type NaturalLanguageQuery = z.infer<typeof NaturalLanguageQuerySchema>;

export type DatabaseNlQueryNode = WithParentNode<
  GenerationNode<NaturalLanguageQuery, "natural_language_query">,
  UseCaseNode
>;

export const DatabaseCodeSchema = z.object({
  queryPlan: z.string().describe("Plan for executing the code"),
  code: z.string().describe("Executable code snippet"),
  language: z.string().describe("Programming language used in the code"),
});

export type DatabaseCode = z.infer<typeof DatabaseCodeSchema>;

export type DatabaseCodeNode = WithParentNode<
  GenerationNode<DatabaseCode, "database_code">,
  DatabaseNlQueryNode
>;

export type DatabaseExecutionResultNode = WithParentNode<
  GenerationNode<
    DatabaseExecutionResult & {
      queryOperators?: string[];
      methods?: string[];
      isReferenceAnswer?: boolean;
    },
    "database_execution_result"
  >,
  DatabaseCodeNode
>;
