import { Tool, tool } from "mongodb-rag-core/aiSdk";
import { z } from "zod";

const MongoDbAggregateOperationSchema = z.object({
  databaseName: z.string(),
  collectionName: z.string(),
  pipeline: z
    .array(z.record(z.string(), z.any()))
    .describe("MongoDB aggregation pipeline"),
});

export type MongoDbAggregateOperation = z.infer<
  typeof MongoDbAggregateOperationSchema
>;

export const submitFinalSolutionToolName = "submit-final-solution";

export const submitFinalSolutionTool: Tool = tool({
  name: submitFinalSolutionToolName,
  description: "Submit the final solution of MongoDB operation",
  inputSchema: MongoDbAggregateOperationSchema,
});
