import { z } from "zod";
import { makeFewShotUserMessageExtractorFunction } from "./makeFewShotUserMessageExtractorFunction";
import { ChatCompletionMessageParam } from "openai/resources";
import { updateFrontMatter } from "mongodb-chatbot-server";

export const StepBackUserQueryMongoDbFunctionSchema = z.object({
  transformedUserQuery: z.string().describe("Transformed user query"),
});

export type StepBackUserQueryMongoDbFunction = z.infer<
  typeof StepBackUserQueryMongoDbFunctionSchema
>;

const name = "step_back_user_query";
const description = "Create a user query using the 'step back' method.";

const systemPrompt = `Your purpose is to generate a search query for a given user input.
You are doing this for MongoDB, and all queries relate to MongoDB products.
When constructing the query, take a "step back" to generate a more general search query that finds the data relevant to the user query if relevant.
If the user query is already a "good" search query, do not modify it.
You should also transform the user query into a fully formed question, if relevant.`;

const fewShotExamples: ChatCompletionMessageParam[] = [
  // Example 1
  {
    role: "user",
    content: updateFrontMatter("aggregate filter where flowerType is rose", {
      programmingLanguage: "javascript",
      mongoDbProduct: "Aggregation Framework",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery:
          "How do I filter by specific field value in a MongoDB aggregation pipeline?",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 2
  {
    role: "user",
    content: updateFrontMatter("How long does it take to import 2GB of data?", {
      mongoDbProduct: "MongoDB Atlas",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery:
          "What affects the rate of data import in MongoDB?",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 3
  {
    role: "user",
    content: updateFrontMatter("how to display the first five", {
      mongoDbProduct: "Driver",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery:
          "How do I limit the number of results in a MongoDB query?",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 4
  {
    role: "user",
    content: updateFrontMatter("find documents python code example", {
      programmingLanguage: "python",
      mongoDbProduct: "Driver",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery:
          "Code example of how to find documents using the Python driver.",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 5
  {
    role: "user",
    content: updateFrontMatter("aggregate", {
      mongoDbProduct: "Aggregation Framework",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery: "Aggregation in MongoDB",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 6
  {
    role: "user",
    content: updateFrontMatter("$match", {
      mongoDbProduct: "Aggregation Framework",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery:
          "What is the $match stage in a MongoDB aggregation pipeline?",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 7
  {
    role: "user",
    content: updateFrontMatter("How to connect to a MongoDB Atlas cluster?", {
      mongoDbProduct: "MongoDB Atlas",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery: "How to connect to a MongoDB Atlas cluster?",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
  // Example 8
  {
    role: "user",
    content: updateFrontMatter("connect to a mongodb atlas cluster", {
      mongoDbProduct: "MongoDB Atlas",
    }),
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        transformedUserQuery: "How to connect to a MongoDB Atlas cluster?",
      } satisfies StepBackUserQueryMongoDbFunction),
    },
  },
];

/**
  Generate search query using the ["step back" method of prompt engineering](https://arxiv.org/abs/2310.06117).
 */
export const makeStepBackUserQuery =
  makeFewShotUserMessageExtractorFunction<StepBackUserQueryMongoDbFunction>({
    llmFunction: {
      name,
      description,
      schema: StepBackUserQueryMongoDbFunctionSchema,
    },
    systemPrompt,
    fewShotExamples,
  });
