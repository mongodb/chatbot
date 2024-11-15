import { z } from "zod";
import {
  makeAssistantFunctionCallMessage,
  makeFewShotUserMessageExtractorFunction,
  makeUserMessage,
} from "./makeFewShotUserMessageExtractorFunction";
import { updateFrontMatter } from "mongodb-chatbot-server";
import { OpenAI } from "mongodb-rag-core/openai";

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
For one word queries like "or", "and", "exists", if the query corresponds to a MongoDB operation, transform it into a fully formed question. Ex: 'what is the $or operator in MongoDB?'
You should also transform the user query into a fully formed question, if relevant.`;

const fewShotExamples: OpenAI.ChatCompletionMessageParam[] = [
  // Example 1
  makeUserMessage(
    updateFrontMatter("aggregate filter where flowerType is rose", {
      programmingLanguage: "javascript",
      mongoDbProduct: "Aggregation Framework",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery:
      "How do I filter by specific field value in a MongoDB aggregation pipeline?",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 2
  makeUserMessage(
    updateFrontMatter("How long does it take to import 2GB of data?", {
      mongoDbProduct: "MongoDB Atlas",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery: "What affects the rate of data import in MongoDB?",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 3
  makeUserMessage(
    updateFrontMatter("how to display the first five", {
      mongoDbProduct: "Driver",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery:
      "How do I limit the number of results in a MongoDB query?",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 4
  makeUserMessage(
    updateFrontMatter("find documents python code example", {
      programmingLanguage: "python",
      mongoDbProduct: "Driver",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery:
      "Code example of how to find documents using the Python driver.",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 5
  makeUserMessage(
    updateFrontMatter("aggregate", {
      mongoDbProduct: "Aggregation Framework",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery: "Aggregation in MongoDB",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 6
  makeUserMessage(
    updateFrontMatter("$match", {
      mongoDbProduct: "Aggregation Framework",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery:
      "What is the $match stage in a MongoDB aggregation pipeline?",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 7
  makeUserMessage(
    updateFrontMatter("How to connect to a MongoDB Atlas cluster?", {
      mongoDbProduct: "MongoDB Atlas",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery: "How to connect to a MongoDB Atlas cluster?",
  } satisfies StepBackUserQueryMongoDbFunction),
  // Example 8
  makeUserMessage(
    updateFrontMatter("How to create a new cluster atlas", {
      mongoDbProduct: "MongoDB Atlas",
    })
  ),
  makeAssistantFunctionCallMessage(name, {
    transformedUserQuery: "How to create a new cluster in MongoDB Atlas?",
  } satisfies StepBackUserQueryMongoDbFunction),
];

/**
  Generate search query using the ["step back" method of prompt engineering](https://arxiv.org/abs/2310.06117).
 */
export const makeStepBackUserQuery = makeFewShotUserMessageExtractorFunction({
  llmFunction: {
    name,
    description,
    schema: StepBackUserQueryMongoDbFunctionSchema,
  },
  systemPrompt,
  fewShotExamples,
});
