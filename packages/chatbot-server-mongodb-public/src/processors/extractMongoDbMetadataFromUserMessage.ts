import { z } from "zod";
import { makeNShotUserMessageExtractorFunction } from "./makeNShotUserMessageFunction";
import { ChatCompletionMessageParam } from "openai/resources";
import {
  mongoDbProducts,
  MongoDBProgrammingLanguagesSchema,
} from "../mongoDbMetadata";

export const ExtractMongoDbMetadataFunctionSchema = z.object({
  programmingLanguage: MongoDBProgrammingLanguagesSchema.default("javascript")
    .describe(
      'Programming language present in the content. If no programming language is present and a code example would answer the question, include "javascript".'
    )
    .optional(),
  mongoDbProduct: z
    .string()
    .describe(
      `One or more MongoDB products present in the content. Order by relevancy. Include "Driver" if the user is asking about a programming language with a MongoDB driver.
    Example values: ${mongoDbProducts
      .map((p) => `"${p.name}"`)
      .join(", ")} ...other MongoDB products.
    If the product is ambiguous, say "MongoDB Server".`
    )
    .default("MongoDBServer ")
    .optional(),
});

export type ExtractMongoDbMetadataFunction = z.infer<
  typeof ExtractMongoDbMetadataFunctionSchema
>;

const name = "extract_mongodb_metadata";
const description = "Extract MongoDB-related metadata from a user message";

const systemPrompt = `You are an expert data labeler employed by MongoDB.
You must label metadata about the user query based on its context in the conversation.
Your pay is determined by the accuracy of your labels as judged against other expert labelers, so do excellent work to maximize your earnings to support your family.`;

const fewShotExamples: ChatCompletionMessageParam[] = [
  // Example 1
  {
    role: "user",
    content: "aggregate data",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        programmingLanguage: "javascript",
        mongoDbProduct: "Aggregation Framework",
      } satisfies ExtractMongoDbMetadataFunction),
    },
  },
  // Example 2
  {
    role: "user",
    content: "how to create a new cluster atlas",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        mongoDbProduct: "MongoDB Atlas",
      } satisfies ExtractMongoDbMetadataFunction),
    },
  },
  // Example 3
  {
    role: "user",
    content: "Does atlas search support copy to fields",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        mongoDbProduct: "Atlas Search",
      } satisfies ExtractMongoDbMetadataFunction),
    },
  },
  // Example 4
  {
    role: "user",
    content: "pymongo insert data",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        programmingLanguage: "python",
        mongoDbProduct: "Driver",
      } satisfies ExtractMongoDbMetadataFunction),
    },
  },
  // Example 5
  {
    role: "user",
    content: "How do I create an index in MongoDB using the Java driver?",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        programmingLanguage: "java",
        mongoDbProduct: "Driver",
      } satisfies ExtractMongoDbMetadataFunction),
    },
  },
  // Example 6
  {
    role: "user",
    content: "$lookup",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        mongoDbProduct: "Aggregation Framework",
      } satisfies ExtractMongoDbMetadataFunction),
    },
  },
];

/**
  Extract metadata relevant to the MongoDB docs chatbot
  from a user message in the conversation.
 */

export const extractMongoDbMetadataFromUserMessage =
  makeNShotUserMessageExtractorFunction<ExtractMongoDbMetadataFunction>({
    llmFunction: {
      name,
      description,
      schema: ExtractMongoDbMetadataFunctionSchema,
    },
    systemPrompt,
    fewShotExamples,
  });