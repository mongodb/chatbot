import { GetChatCompletionsOptions } from "@azure/openai";
import "dotenv/config";
import { OpenAIClient } from "@azure/openai";
import { strict as assert } from "assert";
import {
  ChatLlm,
  LlmAnswerQuestionParams,
  OpenAiChatMessage,
  SystemPrompt,
  Tool,
} from "./ChatLlm";

export type GenerateUserPromptParams = {
  question: string;
  chunks: string[];
};
/**
  Generate the user prompt sent to the {@link ChatLlm}.
  This should include the content from vector search.
 */
export type GenerateUserPrompt = (
  params: GenerateUserPromptParams
) => Promise<OpenAiChatMessage & { role: "user" }>;

/**
  Configuration for the {@link makeOpenAiChatLlm} function.
 */
export interface MakeOpenAiChatLlmParams {
  deployment: string;
  openAiClient: OpenAIClient;
  openAiLmmConfigOptions: GetChatCompletionsOptions;
  generateUserPrompt: GenerateUserPrompt;
  systemPrompt: SystemPrompt;
  tools?: Tool[];
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
  tools = [],
}: MakeOpenAiChatLlmParams): ChatLlm {
  const toolDict: { [key: string]: Tool } = {};
  tools.forEach((tool) => {
    const name = tool.definition.name;
    toolDict[name] = tool;
  });

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
        }
      );
      return completionStream;
    },
    async callTool(message: OpenAiChatMessage) {
      // Only call tool if the message is an assistant message with a function call.
      assert(
        message.role === "assistant" && message.functionCall !== undefined,
        `Last message must be function call: ${JSON.stringify(message)}`
      );
      const availableFunctions = Object.keys(toolDict);
      assert(
        availableFunctions.includes(message.functionCall.name),
        `Function not found: ${message.functionCall.name}. Available functions: ${availableFunctions}`
      );

      const { functionCall } = message;
      const tool = toolDict[functionCall.name];
      const response = await tool.call(JSON.parse(functionCall.arguments));
      return response;
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
}: LlmAnswerQuestionParams & {
  generateUserPrompt: GenerateUserPrompt;
  systemPrompt: SystemPrompt;
}): Promise<OpenAiChatMessage[]> {
  const lastMessage = messages[messages.length - 1];
  assert(messages.length > 0, "No messages provided");
  if (lastMessage.role === "user") {
    const newestMessageForLlm = await generateUserPrompt({
      question: lastMessage.content,
      chunks,
    });
    return [...messages.slice(0, -1), newestMessageForLlm];
  }
  return messages;
}
