import { GetChatCompletionsOptions } from "@azure/openai";
import "dotenv/config";
import { OpenAIClient } from "@azure/openai";
import { strict as assert } from "assert";
import {
  ChatLlm,
  LlmAnswerQuestionParams,
  OpenAiChatMessage,
  Tool,
} from "./ChatLlm";

/**
  Configuration for the {@link makeOpenAiChatLlm} function.
 */
export interface MakeOpenAiChatLlmParams {
  deployment: string;
  openAiClient: OpenAIClient;
  openAiLmmConfigOptions: GetChatCompletionsOptions;
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
  tools,
}: MakeOpenAiChatLlmParams): ChatLlm {
  const toolDict: { [key: string]: Tool } = {};
  tools?.forEach((tool) => {
    const name = tool.definition.name;
    toolDict[name] = tool;
  });

  return {
    async answerQuestionStream({ messages }: LlmAnswerQuestionParams) {
      const completionStream = await openAiClient.streamChatCompletions(
        deployment,
        messages,
        {
          ...openAiLmmConfigOptions,
          functions: tools?.map((tool) => tool.definition),
        }
      );
      return completionStream;
    },
    async answerQuestionAwaited({ messages }: LlmAnswerQuestionParams) {
      const {
        choices: [choice],
      } = await openAiClient.getChatCompletions(deployment, messages, {
        ...openAiLmmConfigOptions,
        functions: tools?.map((tool) => tool.definition),
      });
      const { message } = choice;
      if (!message) {
        throw new Error("No message returned from OpenAI");
      }
      return message as OpenAiChatMessage;
    },
    async callTool(message: OpenAiChatMessage) {
      // Only call tool if the message is an assistant message with a function call.
      assert(
        message.role === "assistant" && message.functionCall !== undefined,
        `Message must be a tool call`
      );
      assert(
        Object.keys(toolDict).includes(message.functionCall.name),
        `Tool not found`
      );

      const { functionCall } = message;
      const tool = toolDict[functionCall.name];
      const toolResponse = await tool.call(JSON.parse(functionCall.arguments));
      return toolResponse;
    },
  };
}
