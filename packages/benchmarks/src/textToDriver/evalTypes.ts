import { EvalCase, EvalScorer } from "braintrust";
import { ExecuteGeneratedDriverCodeResult } from "./executeGeneratedDriverCode";
import { z } from "zod";

export const TextToDriverInputSchema = z.object({
  nl_query: z.string().describe(`Natural language query for the database.

@example "get the total number of books by each author"`),
  dataset_name: z.string().describe(`The name of the dataset.

@example "book-store-recommended"`),
});
/**
  Natural language query
  @example "get the total number of books by each author"
 */
export type TextToDriverInput = z.infer<typeof TextToDriverInputSchema>;

/**
  Output of the task.
 */
export type TextToDriverOutput = {
  generatedCode: string;
  execution: ExecuteGeneratedDriverCodeResult;
};

export const TextToDriverExpectedSchema = z.string();
/**
  JSON string of the expected output
  @example '[{"author": "Jane Austen", "totalBooks": 5}, {"author": "Charles Dickens", "totalBooks": 3}]'
 */
export type TextToDriverExpected = z.infer<typeof TextToDriverExpectedSchema>;

const SqlTagCategorySchema = z.enum(["SIMPLE_SELECT", "COMPLEX_SELECT"]);

const SqlTagSubcategorySchema = z.enum([
  "SELECT",
  "AGGREGATION",
  "GROUP_BY",
  "JOIN",
  "SET_OPERATION",
  "SUBQUERY",
]);

// Define Zod schema for TextToDriverMetadata
const TextToDriverMetadataSchema = z.object({
  sql: z.object({
    tags: z
      .object({
        category: SqlTagCategorySchema,
        subcategories: z.array(SqlTagSubcategorySchema),
      })
      .nullable(),
    query: z
      .string()
      .describe(
        "SQL query for SQL database that is similar to the MongoDB query."
      ),
  }).describe(`SQL query for SQL database that is similar to the MongoDB query.
Taken from Spider SQL dataset.

@example "SELECT COUNT(*) FROM books WHERE author = 'Jane Austen';"`),
  app_mod_case_id: z.number().optional()
    .describe(`ID of the evaluation case from the App Modernization dataset.
@example 1`),
  orderMatters: z
    .boolean()
    .optional()
    .describe(`If true, the order of elements in arrays matters.`),
  isAggregation: z
    .boolean()
    .optional()
    .describe(`If true, the output is an aggregation operation.`),
});

/**
  Metadata for the task. Provided in the input data dataset.
 */
export type TextToDriverMetadata = z.infer<typeof TextToDriverMetadataSchema>;

export type TextToDriverEvalScorer = EvalScorer<
  TextToDriverInput,
  TextToDriverOutput,
  TextToDriverExpected,
  TextToDriverMetadata
>;

export const TextToDriverEvalCaseSchema: z.ZodSchema<
  EvalCase<TextToDriverInput, TextToDriverExpected, TextToDriverMetadata>
> = z.object({
  input: TextToDriverInputSchema,
  expected: TextToDriverExpectedSchema,
  metadata: TextToDriverMetadataSchema,
});

/**
  Evaluation case for the task.
 */
export type TextToDriverEvalCase = z.infer<typeof TextToDriverEvalCaseSchema>;
