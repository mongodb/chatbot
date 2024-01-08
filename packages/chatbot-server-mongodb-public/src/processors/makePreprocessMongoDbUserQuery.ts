import {
  QueryPreprocessorFunc,
  updateFrontMatter,
  OpenAIClient,
  Message,
  FunctionDefinition,
  OpenAiChatMessage,
  QueryPreprocessorResult,
} from "mongodb-chatbot-server";
import { stripIndents } from "common-tags";

const searchFunctionDefinition: FunctionDefinition = {
  name: "search-content",
  description: "Search for content in the MongoDB documentation.",
  parameters: {
    type: "object",
    properties: {
      programmingLanguage: {
        type: "string",
        description:
          'Programming languages present in the content ordered by relevancy. If no programming language is present and the user is asking for a code example, include "shell".',
        default: "shell",
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
      mongoDbProducts: {
        type: "string",
        description: stripIndents`One or more MongoDB products present in the content. Order by relevancy. Include "Driver" if the user is asking about a programming language with a MongoDB driver.
        Example values: ["MongoDB Atlas", "Atlas Charts", "Atlas Search", "Atlas CLI", "Aggregation Framework", "MongoDB Server", "Compass", "MongoDB Connector for BI", "Realm SDK", "Driver", "Atlas App Services",]`,
      },
      query: {
        type: "string",
        description: stripIndents`Using your knowledge of MongoDB and the conversational context, rephrase the latest user query as a question to make it more meaningful. Include relevant MongoDB products and programming languages in the query if they are not already present.stripIndents
        Examples:
        user input: create chart
        query: How do I create a chart in MongoDB Atlas Charts?
        user input: node $lookup
        query: How do I perform a $lookup operation using the MongoDB Node.js Driver?`,
      },
      rejectQuery: {
        type: "boolean",
        description:
          "Set to `true` if the user query is hostile/offensive, disparages MongoDB or its products, doesn't make any logical sense in relation to MongoDB or its products, or is gibberish.",
      },
    },
    required: ["query", "rejectQuery"],
  },
};

interface ContentSearchResponse {
  programmingLanguage?: string;
  mongoDbProducts?: string[];
  query: string;
  rejectQuery: boolean;
}

const systemPrompt = {
  role: "system",
  content:
    "You are an AI-powered API that helps developers find answers to their MongoDB questions. You are a MongoDB expert. Process the user query in the context of the conversation into the following data type.",
} satisfies OpenAiChatMessage;

/**
  Query preprocessor that uses the Azure OpenAI service to preprocess
  the user query.

  The query preprocessor performs the following:

  - Adds metadata to the query to yield better vector search results.
  - Transforms the query in the context of the conversation to yield better vector search results.
  - Advises the server to not respond if the query is inappropriate.

 */
export function makePreprocessMongoDbUserQuery({
  openAiClient,
  deployment,
}: {
  openAiClient: OpenAIClient;
  deployment: string;
}): QueryPreprocessorFunc<
  QueryPreprocessorResult & Partial<ContentSearchResponse>
> {
  return async ({ query, messages }) => {
    if (query === undefined) {
      return { query, rejectQuery: false };
    }
    const userMessage = {
      role: "user",
      content: generateMongoDbQueryPreProcessorPrompt({
        query,
        messages: messages ?? [],
      }),
    } satisfies OpenAiChatMessage;
    const response = await openAiClient.getChatCompletions(
      deployment,
      [systemPrompt, userMessage],
      {
        functions: [searchFunctionDefinition],
        functionCall: {
          name: searchFunctionDefinition.name,
        },
        temperature: 0,
      }
    );
    const result = response.choices[0].message;
    if (result === undefined) {
      throw new Error("No response from OpenAI");
    }
    if (!result.functionCall) {
      throw new Error("No function call in response from OpenAI");
    }
    const data: ContentSearchResponse = JSON.parse(
      result.functionCall.arguments
    );

    return {
      ...data,
      query: addMetadataToQuery(data),
    };
  };
}

export function generateMongoDbQueryPreProcessorPrompt({
  query,
  messages,
  numMessagesToInclude = 4,
}: {
  query: string;
  messages: Message[];
  numMessagesToInclude?: number;
}) {
  query = query.trim();

  // If the query is only one word, add "for MongoDB" to the end of it. This is to help the LLM
  // Also, if the query is "mongodb", don't add "for MongoDB" to the end of it
  // since that doesn't make logical sense.
  if (query.split(/\s/).length === 1 && query.toLowerCase() !== "mongodb") {
    query += " for MongoDB";
  }
  const conversationHistory = messages.length
    ? messages
        .filter((message) => message.role !== "system") // remove system message
        .slice(0 - numMessagesToInclude) // only use last 4 messages
        .reduce((acc, message) => {
          return `${acc}\n\n${message.role.toUpperCase()}:\n${message.content}`;
        }, "") // convert conversation to string
        .trim() // remove whitespace
    : "No previous conversation history.";

  // This is adapted from llamaindex https://github.com/jerryjliu/llama_index/blob/551643ac725306560fc635787e7c7a1f197d9393/llama_index/chat_engine/condense_question.py#L23
  const prompt = `Given a conversation (between USER and ASSISTANT) and a follow up message from USER, output an object conforming to the given TypeScript type.

<Conversation History>
${conversationHistory}


<USER Follow Up Message>
${query}

<Standalone question>`;

  return prompt;
}

function addMetadataToQuery({
  query,
  programmingLanguage,
  mongoDbProducts,
}: ContentSearchResponse): string | undefined {
  return updateFrontMatter(query, {
    programmingLanguage,
    mongoDbProducts,
  });
}
