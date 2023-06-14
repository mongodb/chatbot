import { ChatCompletions, ChatMessage } from "@azure/openai";
import {
  OpenAiChatClient,
  SYSTEM_PROMPT,
  GENERATE_USER_PROMPT,
  OPENAI_LLM_CONFIG_OPTIONS,
} from "../integrations/openai";
import { logger } from "./logger";

interface LlmAnswerQuestionParams {
  messages: Message[];
  chunks: string[];
}

class LlmService {
  private llmProvider: LlmProvider;
  constructor(llmProvider: LlmProvider) {
    this.llmProvider = llmProvider;
  }

  async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
    logger.info("Conversation: ", messages);
    logger.info("Chunks: ", chunks);
    const answer = await this.llmProvider.answerQuestionStream({
      messages,
      chunks,
    });
    logger.info("Answer: ", answer);
    return answer;
  }
  async answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams) {
    logger.info("Conversation: ", messages);
    logger.info("Chunks: ", chunks);
    const answer = await this.llmProvider.answerQuestionAwaited({
      messages,
      chunks,
    });
    logger.info("Answer: ", answer);
    return answer;
  }
}

// Abstract interface for embedding provider to make it easier to swap out
// different providers in the future.
interface LlmProvider {
  answerQuestionStream({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<AsyncIterable<any>>;
  answerQuestionAwaited({
    messages,
    chunks,
  }: LlmAnswerQuestionParams): Promise<ChatMessage>;
}

class OpenAILlmProvider implements LlmProvider {
  private openAiChatClient: OpenAiChatClient;

  constructor(openAiChatClient: OpenAiChatClient) {
    this.openAiChatClient = openAiChatClient;
  }

  // NOTE: for streaming implementation, see // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
  async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
    const messagesForLlm = this.prepConversationForLlm({ messages, chunks });
    const completionStream = await this.openAiChatClient.chatStream({
      messages: messagesForLlm,
      options: { ...OPENAI_LLM_CONFIG_OPTIONS, stream: true },
    });
    return completionStream;
  }

  async answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams) {
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
    return message;
  }
  private prepConversationForLlm({
    messages,
    chunks,
  }: LlmAnswerQuestionParams) {
    this.validateConversation(messages);
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
  private validateConversation(messages: Message[]) {
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
    // 3 b/c must be at least 1) system prompt, 2) initial message from chatbot and 3) latest user prompt
    if (messages.length >= 3) {
      throw new Error("No messages provided");
    }
    const secondToLastMessage = messages[messages.length - 2];
    if (secondToLastMessage.role !== "assistant") {
      throw new Error(`Second to last message must be assistant message`);
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role !== "user") {
      throw new Error(`Last message must be user message`);
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
const openAIProvider = new OpenAILlmProvider(openAiClient);
export const llm = new LlmService(openAIProvider);
