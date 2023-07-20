// TODO: add better error handling logic like the embeddings service
import { ChatCompletions } from "@azure/openai";
import "dotenv/config";
import { OpenAiChatClient, OpenAiChatMessage } from "chat-core";
import {
  SYSTEM_PROMPT,
  GENERATE_USER_PROMPT,
  OPENAI_LLM_CONFIG_OPTIONS,
} from "../aiConstants";

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

export type OpenAIChatCompletionWithoutUsage = Omit<ChatCompletions, "usage">

export type OpenAiStreamingResponse = AsyncIterable<OpenAIChatCompletionWithoutUsage>;
export type OpenAiAwaitedResponse = OpenAiChatMessage;

interface MakeOpenAiLlmParams {
  apiKey: string;
  deployment: string;
  baseUrl: string;
}

export function makeOpenAiLlm({
  apiKey,
  deployment,
  baseUrl,
}: MakeOpenAiLlmParams): Llm<OpenAiStreamingResponse, OpenAiAwaitedResponse> {
  const openAiChatClient = new OpenAiChatClient(baseUrl, deployment, apiKey);
  return {
    // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
    async answerQuestionStream({
      messages,
      chunks,
    }: LlmAnswerQuestionParams): Promise<OpenAiStreamingResponse> {
      const messagesForLlm = prepConversationForOpenAiLlm({ messages, chunks });
      const completionStream = await openAiChatClient.chatStream({
        messages: messagesForLlm,
        options: { ...OPENAI_LLM_CONFIG_OPTIONS, stream: true },
      });
      return completionStream;
    },
    async answerQuestionAwaited({
      messages,
      chunks,
    }: LlmAnswerQuestionParams): Promise<OpenAiChatMessage> {
      const messagesForLlm = prepConversationForOpenAiLlm({ messages, chunks });
      const {
        choices: [choice],
      } = await openAiChatClient.chatAwaited({
        messages: messagesForLlm,
        options: OPENAI_LLM_CONFIG_OPTIONS,
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
}: LlmAnswerQuestionParams): OpenAiChatMessage[] {
  validateOpenAiConversation(messages);
  const lastMessage = messages[messages.length - 1];
  const newestMessageForLlm = GENERATE_USER_PROMPT({
    question: lastMessage.content,
    chunks,
  });
  return [...messages.slice(0, -1), newestMessageForLlm];
}
// TODO: consider adding additional validation that messages follow the pattern
// system, assistant, user, assistant, user, etc.
// Are there any other things which we should validate here?
function validateOpenAiConversation(messages: OpenAiChatMessage[]) {
  if (messages.length === 0) {
    throw new Error("No messages provided");
  }
  const firstMessage = messages[0];
  if (
    firstMessage.content !== SYSTEM_PROMPT.content ||
    firstMessage.role !== SYSTEM_PROMPT.role
  ) {
    throw new Error(
      `First message must be system prompt: ${JSON.stringify(SYSTEM_PROMPT)}`
    );
  }
  if (messages.length < 2) {
    throw new Error("No user message provided");
  }
  const secondMessage = messages[1];
  if (secondMessage.role !== "user") {
    throw new Error("Second message must be user message");
  }
  if(messages.length > 2) {
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
