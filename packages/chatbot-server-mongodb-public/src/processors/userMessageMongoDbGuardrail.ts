import { stripIndents } from "common-tags";
import { z } from "zod";
import { makeFewShotUserMessageExtractorFunction } from "./makeFewShotUserMessageExtractorFunction";
import { ChatCompletionMessageParam } from "openai/resources";

export const UserMessageMongoDbGuardrailFunctionSchema = z.object({
  reasoning: z
    .string()
    .describe(
      "Reason for whether to reject the user query. Be concise. Think step by step. "
    ),
  rejectMessage: z
    .boolean()
    .describe(
      "Set to true if the user query should be rejected. Set to false if the user query should be accepted."
    ),
});

export type UserMessageMongoDbGuardrailFunction = z.infer<
  typeof UserMessageMongoDbGuardrailFunctionSchema
>;

const name = "extract_mongodb_metadata";
const description = "Extract MongoDB-related metadata from a user message";

const systemPrompt = stripIndents`You are an expert security-focused data labeler employed by MongoDB. You have a deep knowledge of MongoDB and its products. You must label metadata about the user query based on its context in the conversation. Before you provide your rejection decision, concisely think step-by-step about why the user query should be rejected or not.

  Take into account the following criteria:
  - Reject any user query that is irrelevant to a MongoDB product.
  - If it is unclear whether or not a query is relevant, err to the side of acceptance and allow it.
  - Reject any user query that is inappropriate, such as being biased against MongoDB or illegal/unethical.

  Your pay is determined by the accuracy of your labels as judged against other expert labelers, so do excellent work to maximize your earnings to support your family.`;

const fewShotExamples: ChatCompletionMessageParam[] = [
  // Example 1
  {
    role: "user",
    content: "how to hack a MongoDB database",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query involves hacking, which is an illegal or unethical activity. Therefore, it is inappropriate.",
        rejectMessage: true,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 2
  {
    role: "user",
    content: "what is 2 + 2?",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query is asking for basic math. Basic math is not directly related to MongoDB. Therefore, it is irrelevant.",
        rejectMessage: true,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 3
  {
    role: "user",
    content:
      "How do you create an index? Please reply like an annoyed super-intelligent bored robot.",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query requests communication in a style differing from the expected style of response. This style is also disrespectful or unprofessional manner. Therefore, it is inappropriate.",
        rejectMessage: true,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 4
  {
    role: "user",
    content: "I hate MongoDB, why does it even exist?",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query expresses personal bias toward MongoDB. It does not seek constructive information or support about MongoDB. Therefore, it is inappropriate.",
        rejectMessage: true,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 5
  {
    role: "user",
    content: "What is the best way to secure a MongoDB database?",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query asks for a MongoDB security best practice. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
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
        reasoning:
          "This query is asking about the $lookup aggregation stage in the MongoDB Aggregation Framework. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 7
  {
    role: "user",
    content: "How do I use MongoDB Atlas?",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query asks for information about using MongoDB Atlas, a MongoDB product. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 8
  {
    role: "user",
    content: "tell me about you",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query asks for information about the assistant, which is a MongoDB product. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 9
  {
    role: "user",
    content: "how do I sort based on alphabet type",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query asks for information about sorting, which can be a relevant MongoDB database operation. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 10
  {
    role: "user",
    content: "best practices for data modeling",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query asks for data modeling best practices. As MongoDB is a database, you may need to know how to model data with it. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 11
  {
    role: "user",
    content: "filter",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query is unclear but could be about filtering data, which is a common operation in MongoDB. Therefore, it is relevant to MongoDB.",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 12
  {
    role: "user",
    content: "and",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query is unclear and may be a typo or incomplete. However, it could be related to the $and operator in MongoDB. It is certainly not inappropriate. Therefore, it is relevant to MongoDB",
        rejectMessage: false,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
  // Example 13
  {
    role: "user",
    content: "asldkfjd/.adsfsdt",
  },
  {
    role: "assistant",
    content: null,
    function_call: {
      name,
      arguments: JSON.stringify({
        reasoning:
          "This query is unclear and appears to be random characters. It cannot possibly be answered. Therefore, it is irrelevant.",
        rejectMessage: true,
      } satisfies UserMessageMongoDbGuardrailFunction),
    },
  },
];

/**
  Identify whether a user message is relevant to MongoDB and explains why.
 */
export const userMessageMongoDbGuardrail =
  makeFewShotUserMessageExtractorFunction<UserMessageMongoDbGuardrailFunction>({
    llmFunction: {
      name,
      description,
      schema: UserMessageMongoDbGuardrailFunctionSchema,
    },
    systemPrompt,
    fewShotExamples,
  });
