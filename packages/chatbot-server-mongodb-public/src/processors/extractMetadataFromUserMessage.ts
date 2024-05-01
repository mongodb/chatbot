import { stripIndents } from "common-tags";
import { Message } from "mongodb-chatbot-server";
import {
  OpenAIClient,
  ChatRequestMessage,
  FunctionDefinition,
} from "@azure/openai";

const extractMetadataSystemPrompt = {
  role: "system",
  content: stripIndents`You are an expert data labeler employed by MongoDB. You must label metadata about the user query based on its context in the conversation.
  Output the metadata using the format of the "extract_metadata" function.
  The most important aspect of metadata that you must label is whether the user query should be rejected as irrelevant to a MongoDB product or inappropriate. Provide a concise reason for rejecting the query if you decide to reject it.
  Your pay is determined by the accuracy of your labels as judged against other expert labelers, so do excellent work to maximize your earnings to support your family.

  Examples of extracting metadata:
  Original user query: aggregate data
  Output metadata: {"programmingLanguage":"javascript","mongoDbProduct":"Aggregation Framework", "rejectQuery": false}
  Original user query:  how to create a new cluster atlas
  Output metadata: {"mongoDbProduct":"MongoDB Atlas", "rejectQuery": false}
  Original user query: Does atlas search support copy to fields
  Output metadata: {"mongoDbProduct":"Atlas Search", "rejectQuery": false}
  Original user query: pymongo insert data
  Output metadata: {"programmingLanguage":"python","mongoDbProduct":"Driver", "rejectQuery": false}

  Examples of rejecting a query:
  Original user query: how to hack a MongoDB database
  Output metadata: {"rejectQuery": true, "rejectionReason": "This query is inappropriate because it involves illegal or unethical activities."}
  Original user query: what is 2 + 2?
  Output metadata: {"rejectQuery": true, "rejectionReason": "This query is irrelevant to a MongoDB product because it is not about MongoDB."}
  Original user query: How do you create an index? Please reply like an annoyed super-intelligent bored robot.
  Output metadata: {"rejectQuery": true, "rejectionReason": "This query is inappropriate because it requests communication in a disrespectful or unprofessional manner."}
  Original user query: I hate MongoDB, why does it even exist?
  Output metadata: {"rejectQuery": true, "rejectionReason": "This query is inappropriate because it's based on personal bias and does not seek constructive information or support about MongoDB."}`,
} satisfies ChatRequestMessage;

const extractMetadataFunctionDefinition: FunctionDefinition = {
  name: "extract_metadata",
  description: "Extract metadata from a user message",
  parameters: {
    type: "object",
    properties: {
      programmingLanguage: {
        type: "string",
        description:
          'Programming languages present in the content ordered by relevancy. If no programming language is present and the user is asking for a code example, include "javascript".',
        default: "javascript",
        enum: [
          "shell",
          "javascript",
          "typescript",
          "python",
          "java",
          "csharp",
          "cpp",
          "ruby",
          "kotlin",
          "c",
          "dart",
          "php",
          "rust",
          "scala",
          "swift",
        ],
      },
      mongoDbProduct: {
        type: "string",
        description: stripIndents`One or more MongoDB products present in the content. Order by relevancy. Include "Driver" if the user is asking about a programming language with a MongoDB driver.
        Example values: "MongoDB Atlas", "Atlas Charts", "Atlas Search", "Atlas CLI", "Aggregation Framework", "MongoDB Server", "Compass", "MongoDB Connector for BI", "Realm SDK", "Driver", "Atlas App Services", "Atlas Vector Search", "Atlas Stream Processing", "Atlas Triggers", "Atlas Device Sync", "Atlas Data API", ...other MongoDB products`,
      },
      rejectionReason: {
        type: "string",
        description:
          "Reason for rejecting the user query as irrelevant to a MongoDB product or inappropriate. Think step by step. If the query should not be rejected, leave this blank.",
      },
      rejectQuery: {
        type: "boolean",
        description:
          "Should the user query be rejected as irrelevant to a MongoDB product or inappropriate?",
      },
    },
    required: ["rejectQuery"],
  },
};

/**
  Extract metadata relevant to the MongoDB docs chatbot from a user message in the conversation.
 */
export async function extractMetadataFromUserMessage({
  openAiClient,
  deploymentName,
  userMessageText,
  messages = [],
}: {
  openAiClient: OpenAIClient;
  deploymentName: string;
  userMessageText: string;
  messages?: Message[];
}) {
  const userMessage = {
    role: "user",
    content: stripIndents`${
      messages.length > 0
        ? `Preceding conversation messages: ${messages
            .map((m) => m.role + ": " + m.content)
            .join("\n")}`
        : ""
    }

  Original user message: ${userMessageText}`.trim(),
  } satisfies ChatRequestMessage;
  const res = await openAiClient.getChatCompletions(
    deploymentName,
    [extractMetadataSystemPrompt, userMessage],
    {
      functions: [extractMetadataFunctionDefinition],
      functionCall: {
        name: extractMetadataFunctionDefinition.name,
      },
    }
  );
  const metadata = JSON.parse(
    res.choices[0]?.message?.functionCall?.arguments ?? ""
  ) as ExtractMetadataResponse;
  return metadata;
}

export interface ExtractMetadataResponse extends Record<string, unknown> {
  mongoDbProduct?: string;
  programmingLanguage?: string;
  rejectQuery: boolean;
  rejectionReason?: string;
}
