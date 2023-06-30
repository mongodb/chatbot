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
export interface LlmProvider<T, U> {
  answerQuestionStream({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<T>;
  answerQuestionAwaited({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<U>;
}

export type OpenAiStreamingResponse = AsyncIterable<
  Omit<ChatCompletions, "usage">
>;
export type OpenAiAwaitedResponse = OpenAiChatMessage;

export class OpenAiLlmProvider
  implements LlmProvider<OpenAiStreamingResponse, OpenAiAwaitedResponse>
{
  private openAiChatClient: OpenAiChatClient;

  constructor(openAiChatClient: OpenAiChatClient) {
    this.openAiChatClient = openAiChatClient;
  }

  // NOTE: for streaming implementation, see // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
  async answerQuestionStream({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<OpenAiStreamingResponse> {
    const messagesForLlm = this.prepConversationForLlm({ messages, chunks });
    const completionStream = await this.openAiChatClient.chatStream({
      messages: messagesForLlm,
      options: { ...OPENAI_LLM_CONFIG_OPTIONS, stream: true },
    });
    return completionStream;
  }

  async answerQuestionAwaited({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<OpenAiChatMessage> {
    const messagesForLlm = this.prepConversationForLlm({ messages, chunks });
    const {
      choices: [choice],
    } = await this.openAiChatClient.chatAwaited({
      messages: messagesForLlm,
      options: OPENAI_LLM_CONFIG_OPTIONS,
    });
    const { message } = choice;
    if (!message) {
      throw new Error("No message returned from OpenAI");
    }
    return message as OpenAiChatMessage;
  }
  private prepConversationForLlm({
    messages,
    chunks,
  }: LlmAnswerQuestionParams) {
    this.validateConversation(messages);
    const lastMessage = messages.at(-1);
    if (!lastMessage) {
      throw new Error("No last message");
    }
    const newestMessageForLlm = GENERATE_USER_PROMPT({
      question: lastMessage.content,
      chunks,
    });
    return [...messages.slice(0, -1), newestMessageForLlm];
  }

  // TODO: consider adding additional validation that messages follow the pattern
  // system, assistant, user, assistant, user, etc.
  // Are there any other things which we should validate here?
  private validateConversation(messages: OpenAiChatMessage[]) {
    // Messages should never be empty
    if (messages.length === 0) {
      throw new Error("No messages provided");
    }
    // First message should always be the system prompt
    const firstMessage = messages[0];
    if (
      firstMessage.content !== SYSTEM_PROMPT.content ||
      firstMessage.role !== SYSTEM_PROMPT.role
    ) {
      throw new Error(
        `First message must be system prompt: ${JSON.stringify(SYSTEM_PROMPT)}`
      );
    }
    // Second message should always be from the user
    const secondMessage = messages[1];
    if (secondMessage.role !== "user") {
      throw new Error(`Second message must be a user message`);
    }
    if (messages.length >= 3) {
      const secondToLastMessage = messages.at(-2);
      const lastMessage = messages.at(-1);
      if (!secondToLastMessage || !lastMessage) {
        throw new Error(`Second to last and last message must exist`);
      }
      if (secondToLastMessage.role === lastMessage.role) {
        throw new Error(`Messages must alternate roles`);
      }
    }
  }
}

// Export singleton instance of LLM service for use in application
const { OPENAI_ENDPOINT, OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_API_KEY } =
  process.env;
const openAiClient = new OpenAiChatClient(
  OPENAI_ENDPOINT!,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT!,
  OPENAI_API_KEY!
);
export const llm = new OpenAiLlmProvider(openAiClient);
