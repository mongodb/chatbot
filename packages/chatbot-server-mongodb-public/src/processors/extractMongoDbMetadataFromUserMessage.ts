import { z } from "zod";
import {
  makeAssistantFunctionCallMessage,
  makeFewShotUserMessageExtractorFunction,
  makeUserMessage,
} from "./makeFewShotUserMessageExtractorFunction";
import { OpenAI } from "mongodb-rag-core/openai";
import {
  mongoDbProductNames,
  mongoDbProgrammingLanguageIds,
} from "../mongoDbMetadata";

export const ExtractMongoDbMetadataFunctionSchema = z.object({
  programmingLanguage: z
    .enum(mongoDbProgrammingLanguageIds)
    .default("javascript")
    .describe(
      'Programming language present in the content. If no programming language is present and a code example would answer the question, include "javascript".'
    )
    .optional(),
  mongoDbProduct: z
    .enum(mongoDbProductNames)
    .describe(
      `Most important MongoDB products present in the content.
Include "Driver" if the user is asking about a programming language with a MongoDB driver.
If the product is ambiguous, say "MongoDB Server".`
    )
    .default("MongoDB Server")
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

const fewShotExamples: OpenAI.Chat.ChatCompletionMessageParam[] = [
  // Example 1
  makeUserMessage("aggregate data"),
  makeAssistantFunctionCallMessage(name, {
    programmingLanguage: "javascript",
    mongoDbProduct: "Aggregation Framework",
  } satisfies ExtractMongoDbMetadataFunction),
  // Example 2
  makeUserMessage("how to create a new cluster atlas"),
  makeAssistantFunctionCallMessage(name, {
    mongoDbProduct: "MongoDB Atlas",
  } satisfies ExtractMongoDbMetadataFunction),
  // Example 3
  makeUserMessage("Does atlas search support copy to fields"),
  makeAssistantFunctionCallMessage(name, {
    mongoDbProduct: "Atlas Search",
  } satisfies ExtractMongoDbMetadataFunction),
  // Example 4
  makeUserMessage("pymongo insert data"),
  makeAssistantFunctionCallMessage(name, {
    programmingLanguage: "python",
    mongoDbProduct: "Drivers",
  } satisfies ExtractMongoDbMetadataFunction),
  // Example 5
  makeUserMessage("How do I create an index in MongoDB using the Java driver?"),
  makeAssistantFunctionCallMessage(name, {
    programmingLanguage: "java",
    mongoDbProduct: "Drivers",
  } satisfies ExtractMongoDbMetadataFunction),
  // Example 6
  makeUserMessage("$lookup"),
  makeAssistantFunctionCallMessage(name, {
    mongoDbProduct: "Aggregation Framework",
  } satisfies ExtractMongoDbMetadataFunction),
];

/**
  Extract metadata relevant to the MongoDB docs chatbot
  from a user message in the conversation.
 */

export const extractMongoDbMetadataFromUserMessage =
  makeFewShotUserMessageExtractorFunction({
    llmFunction: {
      name,
      description,
      schema: ExtractMongoDbMetadataFunctionSchema,
    },
    systemPrompt,
    fewShotExamples,
  });
