import { Eval, EvalCase, EvalScorer } from "braintrust";
import { DatabaseExecutionResult } from "mongodb-rag-core/executeCode";
import { z } from "zod";

export const TextToDriverInputSchema = z.object({
  nlQuery: z.string().describe(`Natural language query for the database.

@example "get the total number of books by each author"`),
  databaseName: z.string().describe(`The name of the dataset.

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
  execution: DatabaseExecutionResult;
};

export const TextToDriverExpectedSchema = z.object({
  dbQuery: z.string(),
  result: z.any(),
  executionTimeMs: z.number().nullable().optional(),
});

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
  sql: z
    .object({
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
    })
    .describe(
      `SQL query for SQL database that is similar to the MongoDB query.
Taken from Spider SQL dataset.

@example "SELECT COUNT(*) FROM books WHERE author = 'Jane Austen';"`
    )
    .optional(),
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
  complexity: z.string().optional().describe(`The complexity of the query.`),
  generationUuid: z
    .string()
    .optional()
    .describe(`UUID of the generated query.`),
  language: z.string().describe(`The programming language of the query.`),
  methods: z
    .array(z.string())
    .optional()
    .describe(`The methods used in the query.`),
  queryOperators: z
    .array(z.string())
    .optional()
    .describe(`The query operators used in the query.`),
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
  tags: z.array(z.string()).optional(),
  expected: TextToDriverExpectedSchema,
  metadata: TextToDriverMetadataSchema,
});

/**
  Evaluation case for the task.
 */
export type TextToDriverEvalCase = z.infer<typeof TextToDriverEvalCaseSchema>;

export type TextToDriverEval = typeof Eval<
  TextToDriverInput,
  TextToDriverOutput,
  TextToDriverExpected,
  TextToDriverMetadata
>;

export type TextToDriverEvalResult = Awaited<ReturnType<TextToDriverEval>>;

export type TextToDriverEvalParams = Parameters<TextToDriverEval>[1] & {
  maxConcurrency?: number;
};

export type TextToDriverEvalData = TextToDriverEvalParams["data"];

export type TextToDriverEvalTask = TextToDriverEvalParams["task"];

export type TextToDriverEvalScores = TextToDriverEvalParams["scores"];

export interface MakeTextToDriverEvalParams {
  apiKey: string;
  projectName: string;
  experimentName: string;
  metadata?: Record<string, unknown>;
  maxConcurrency?: number;
  timeout?: number;
  data: TextToDriverEvalData;
  task: TextToDriverEvalTask;
  scores: TextToDriverEvalScores;
}

export async function makeTextToDriverEval({
  projectName,
  experimentName,
  metadata,
  maxConcurrency = 10,
  timeout,
  data,
  task,
  scores,
}: MakeTextToDriverEvalParams): Promise<TextToDriverEvalResult> {
  return Eval<
    TextToDriverInput,
    TextToDriverOutput,
    TextToDriverExpected,
    TextToDriverMetadata
  >(projectName, {
    maxConcurrency,
    experimentName,
    timeout,
    metadata,
    data,
    task,
    scores,
  });
}
