import { GetChatCompletionsOptions } from "@azure/openai";
import "dotenv/config";
import { OpenAIClient } from "@azure/openai";
import {
  ChatLlm,
  LlmAnswerQuestionParams,
  OpenAiChatMessage,
  SystemPrompt,
} from "./ChatLlm";

/**
  Generate the user prompt sent to the {@link ChatLlm}.
  This should include the content from vector search.
 */
export type GenerateUserPrompt = ({
  question,
  chunks,
}: {
  question: string;
  chunks: string[];
}) => Promise<OpenAiChatMessage & { role: "user" }>;

/**
  Configuration for the {@link makeOpenAiChatLlm} function.
 */
export interface MakeOpenAiChatLlmParams {
  deployment: string;
  openAiClient: OpenAIClient;
  openAiLmmConfigOptions: GetChatCompletionsOptions;
  generateUserPrompt: GenerateUserPrompt;
  systemPrompt: SystemPrompt;
}

/**
  Construct the {@link ChatLlm} service using the [OpenAI ChatGPT API](https://learn.microsoft.com/en-us/azure/ai-services/openai/chatgpt-quickstart?tabs=command-line&pivots=programming-language-studio).
  The `ChatLlm` wraps the [@azure/openai](https://www.npmjs.com/package/@azure/openai) package.
 */
export function makeOpenAiChatLlm({
  deployment,
  openAiClient,
  openAiLmmConfigOptions,
  generateUserPrompt,
  systemPrompt,
}: MakeOpenAiChatLlmParams): ChatLlm {
  return {
    async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
      const messagesForLlm = await prepConversationForOpenAiLlm({
        messages,
        chunks,
        generateUserPrompt,
        systemPrompt,
      });
      const completionStream = await openAiClient.listChatCompletions(
        deployment,
        messagesForLlm,
        {
          ...openAiLmmConfigOptions,
          stream: true,
        }
      );
      return completionStream;
    },
    async answerQuestionAwaited({ messages, chunks }: LlmAnswerQuestionParams) {
      const messagesForLlm = await prepConversationForOpenAiLlm({
        messages,
        chunks,
        generateUserPrompt,
        systemPrompt,
      });
      const {
        choices: [choice],
      } = await openAiClient.getChatCompletions(
        deployment,
        messagesForLlm,
        openAiLmmConfigOptions
      );
      const { message } = choice;
      if (!message) {
        throw new Error("No message returned from OpenAI");
      }
      return message as OpenAiChatMessage;
    },
  };
}

async function prepConversationForOpenAiLlm({
  messages,
  chunks,
  generateUserPrompt,
  systemPrompt,
}: LlmAnswerQuestionParams & {
  generateUserPrompt: GenerateUserPrompt;
  systemPrompt: SystemPrompt;
}): Promise<OpenAiChatMessage[]> {
  validateOpenAiConversation(messages, systemPrompt);
  const lastMessage = messages[messages.length - 1];
  const newestMessageForLlm = await generateUserPrompt({
    question: lastMessage.content || "",
    chunks,
  });
  return [...messages.slice(0, -1), newestMessageForLlm];
}

function validateOpenAiConversation(
  messages: OpenAiChatMessage[],
  systemPrompt: SystemPrompt
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
