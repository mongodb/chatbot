import { GetChatCompletionsOptions } from "@azure/openai";
import "dotenv/config";
import { LlmConfig } from "../AppConfig";
import { OpenAIClient } from "@azure/openai";
import { Llm, LlmAnswerQuestionParams, OpenAiChatMessage } from "./ChatLlm";

export interface makeOpenAiChatLlmParams {
  deployment: string;
  openAiClient: OpenAIClient;
  openAiLmmConfigOptions: GetChatCompletionsOptions;
  generateUserPrompt: ({
    question,
    chunks,
  }: {
    question: string;
    chunks: string[];
  }) => OpenAiChatMessage & { role: "user" };
  systemPrompt: OpenAiChatMessage & { role: "system" };
}

export function makeOpenAiChatLlm({
  deployment,
  openAiClient,
  openAiLmmConfigOptions,
  generateUserPrompt,
  systemPrompt,
}: makeOpenAiChatLlmParams): Llm {
  return {
    // NOTE: for example streaming data, see https://github.com/openai/openai-node/issues/18#issuecomment-1369996933
    async answerQuestionStream({ messages, chunks }: LlmAnswerQuestionParams) {
      const messagesForLlm = prepConversationForOpenAiLlm({
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
      const messagesForLlm = prepConversationForOpenAiLlm({
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
