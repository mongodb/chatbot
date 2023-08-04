// TODO: add better error handling logic like the embeddings service
import { ChatCompletions, GetChatCompletionsOptions } from "@azure/openai";
import "dotenv/config";
import { OpenAiChatClient, OpenAiChatMessage } from "chat-core";
import { LlmConfig } from "../AppConfig";

export interface LlmAnswerQuestionParams {
  messages: OpenAiChatMessage[];
  chunks: string[];
}

// Abstract interface for embedding provider to make it easier to swap out
// different providers in the future.
export interface Llm<T, U> {
  answerQuestionStream({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<T>;
  answerQuestionAwaited({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<U>;
}

export type OpenAIChatCompletionWithoutUsage = Omit<ChatCompletions, "usage">;

export type OpenAiStreamingResponse =
  AsyncIterable<OpenAIChatCompletionWithoutUsage>;
export type OpenAiAwaitedResponse = OpenAiChatMessage;

export interface MakeOpenAiLlmParams {
  apiKey: string;
  deployment: string;
  baseUrl: string;
  systemPrompt: OpenAiChatMessage & { role: "system" };
  openAiLmmConfigOptions: GetChatCompletionsOptions;
  generateUserPrompt: ({
    question,
    chunks,
  }: {
    question: string;
    chunks: string[];
  }) => OpenAiChatMessage & { role: "user" };
}

export function makeOpenAiLlm({
  apiKey,
  deployment,
  baseUrl,
  openAiLmmConfigOptions,
  generateUserPrompt,
  systemPrompt,
}: MakeOpenAiLlmParams): Llm<OpenAiStreamingResponse, OpenAiAwaitedResponse> {
  const openAiChatClient = new OpenAiChatClient(baseUrl, deployment, apiKey);
  return {
    // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
    async answerQuestionStream({
      messages,
      chunks,
    }: LlmAnswerQuestionParams): Promise<OpenAiStreamingResponse> {
      const messagesForLlm = prepConversationForOpenAiLlm({
        messages,
        chunks,
        generateUserPrompt,
        systemPrompt,
      });
      const completionStream = await openAiChatClient.chatStream({
        messages: messagesForLlm,
        options: { ...openAiLmmConfigOptions, stream: true },
      });
      return completionStream;
    },
    async answerQuestionAwaited({
      messages,
      chunks,
    }: LlmAnswerQuestionParams): Promise<OpenAiChatMessage> {
      const messagesForLlm = prepConversationForOpenAiLlm({
        messages,
        chunks,
        generateUserPrompt,
        systemPrompt,
      });
      const {
        choices: [choice],
      } = await openAiChatClient.chatAwaited({
        messages: messagesForLlm,
        options: openAiLmmConfigOptions,
      });
      const { message } = choice;
      if (!message) {
        throw new Error("No message returned from OpenAI");
      }
      return message as OpenAiChatMessage;
    },
  };
}

function prepConversationForOpenAiLlm({
  messages,
  chunks,
  generateUserPrompt,
  systemPrompt,
}: LlmAnswerQuestionParams & {
  generateUserPrompt: LlmConfig["generateUserPrompt"];
  systemPrompt: LlmConfig["systemPrompt"];
}): OpenAiChatMessage[] {
  validateOpenAiConversation(messages, systemPrompt);
  const lastMessage = messages[messages.length - 1];
  const newestMessageForLlm = generateUserPrompt({
    question: lastMessage.content,
    chunks,
  });
  return [...messages.slice(0, -1), newestMessageForLlm];
}
// TODO: consider adding additional validation that messages follow the pattern
// system, assistant, user, assistant, user, etc.
// Are there any other things which we should validate here?
function validateOpenAiConversation(
  messages: OpenAiChatMessage[],
  systemPrompt: LlmConfig["systemPrompt"]
) {
  if (messages.length === 0) {
    throw new Error("No messages provided");
  }
  const firstMessage = messages[0];
  if (
    firstMessage.content !== systemPrompt.content ||
    firstMessage.role !== systemPrompt.role
  ) {
    throw new Error(
      `First message must be system prompt: ${JSON.stringify(systemPrompt)}`
    );
  }
  if (messages.length < 2) {
    throw new Error("No user message provided");
  }
  const secondMessage = messages[1];
  if (secondMessage.role !== "user") {
    throw new Error("Second message must be user message");
  }
  if (messages.length > 2) {
    const secondToLastMessage = messages[messages.length - 2];
    const lastMessage = messages[messages.length - 1];

    if (secondToLastMessage.role === lastMessage.role) {
      throw new Error(`Messages must alternate roles`);
    }

    if (lastMessage.role !== "user") {
      throw new Error("Last message must be user message");
    }
  }
}
