import fs from "fs";
import path from "path";
import { createAzureOpenAILanguageModel, createJsonTranslator } from "typechat";
import { MongoDbUserQueryPreprocessorResponse } from "./MongoDbUserQueryPreprocessorResponse";
import { QueryPreprocessorFunc } from "./QueryPreprocessorFunc";
import { retryAsyncOperation } from "../utils";
import { updateFrontMatter } from "chat-core";
import { Message } from "../services";

/**
 Configuration for the Azure OpenAI service.
 */
export interface AzureOpenAiServiceConfig {
  apiKey: string;
  baseUrl: string;
  deployment: string;
  version: string;
}

/**
  Query preprocessor that uses the Azure OpenAI service to preprocess
  the user query via [TypeChat](https://microsoft.github.io/TypeChat/docs/introduction/).

  The query preprocessor performs the following:

  - Adds metadata to the query to yield better vector search results.
  - Transforms the query in the context of the conversation to yield better vector search results.
  - Advises the server to not respond if the query is inappropriate.

 */
export function makePreprocessMongoDbUserQuery({
  azureOpenAiServiceConfig,
  numRetries = 0,
  retryDelayMs = 4000,
}: {
  azureOpenAiServiceConfig: AzureOpenAiServiceConfig;
  /**
    Number of times to retry the query preprocessor if it fails.
    Note that this should generally be a low number because it occurs before the
    query, and will delay the operation of the chatbot if it goes on for a while.
   */
  numRetries?: number;
  /**
    Delay between retries in milliseconds.
    Again this should be a low number to not delay the chatbot if the LLM is down.
   */
  retryDelayMs?: number;
}): QueryPreprocessorFunc<MongoDbUserQueryPreprocessorResponse> {
  const schemaPath = fs.readFileSync(
    path.join(__dirname, "MongoDbUserQueryPreprocessorResponse.d.ts"),
    "utf8"
  );
  const schemaName = "MongoDbUserQueryPreprocessorResponse";
  const { apiKey, baseUrl, deployment, version } = azureOpenAiServiceConfig;

  const model = createAzureOpenAILanguageModel(
    apiKey,
    `${baseUrl}openai/deployments/${deployment}/chat/completions?api-version=${version}`
  );

  // LLM function
  const translator = createJsonTranslator<MongoDbUserQueryPreprocessorResponse>(
    model,
    schemaPath,
    schemaName
  );

  return async ({ query, messages }) => {
    const prompt = generateMongoDbQueryPreProcessorPrompt({ query, messages });

    const response = await retryAsyncOperation(
      translator.translate(prompt),
      numRetries,
      retryDelayMs
    );

    if (!response.success) {
      throw new Error(response.message);
    }
    return {
      ...appendMetadataToPreprocessorResponse(response.data),
      doNotAnswer: response.data.query.includes("DO_NOT_ANSWER"),
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
  const prompt = `Given a conversation (between USER and ASSISTANT) and a follow up message from USER, rewrite the message to be a standalone question that captures all relevant context from the conversation.

<Conversation History>
${conversationHistory}


<USER Follow Up Message>
${query}

<Standalone question>`;

  return prompt;
}

export function appendMetadataToPreprocessorResponse(
  response: MongoDbUserQueryPreprocessorResponse
): MongoDbUserQueryPreprocessorResponse {
  response.query = updateFrontMatter(response.query, {
    programmingLanguages: response.programmingLanguages,
    mongoDbProducts: response.mongoDbProducts,
  });
  return response;
}
