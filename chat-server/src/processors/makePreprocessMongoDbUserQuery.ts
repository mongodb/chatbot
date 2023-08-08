import fs from "fs";
import path from "path";
import { createAzureOpenAILanguageModel, createJsonTranslator } from "typechat";
import { MongoDbUserQueryPreprocessorResponse } from "./MongoDbUserQueryPreprocessorResponse";
import {
  QueryPreprocessorFunc,
  QueryPreprocessorMessage,
} from "./QueryPreprocessorFunc";
import { retryAsyncOperation } from "../utils";

export interface AzureOpenAiServiceConfig {
  apiKey: string;
  baseUrl: string;
  deployment: string;
  version: string;
}
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
    path.join(__dirname, "MongoDbUserQueryPreprocessorResponse.ts"),
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
    return appendMetadataToPreprocessorResponse(response.data);
  };
}

export function generateMongoDbQueryPreProcessorPrompt({
  query,
  messages,
}: {
  query: string;
  messages: QueryPreprocessorMessage[];
}) {
  const conversationHistory = messages.length
    ? messages
        .filter((message) => message.role !== "system") // remove system message
        .slice(-4) // only use last 4 messages
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
  // TODO: append metadata as frontmatter to preprocessor response
  return response;
}
