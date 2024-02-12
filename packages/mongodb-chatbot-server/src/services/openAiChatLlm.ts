import {
  ChatRequestAssistantMessage,
  ChatResponseMessage,
  GetChatCompletionsOptions,
} from "@azure/openai";
import "dotenv/config";
import { OpenAIClient } from "@azure/openai";
import { strict as assert } from "assert";
import {
  ChatLlm,
  LlmAnswerQuestionParams,
  OpenAiChatMessage,
  Tool,
} from "./ChatLlm";
import { Conversation } from "./ConversationsService";

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
}: MakeOpenAiChatLlmParams): Required<ChatLlm> {
  const toolDict: { [key: string]: Tool } = {};
  tools?.forEach((tool) => {
    const name = tool.definition.name;
    toolDict[name] = tool;
  });

  return {
    async answerQuestionStream({
      messages,
      toolCallOptions,
    }: LlmAnswerQuestionParams) {
      const completionStream = await openAiClient.streamChatCompletions(
        deployment,
        messages,
        {
          ...openAiLmmConfigOptions,
          functionCall: toolCallOptions,
          functions: tools?.map((tool) => tool.definition),
        }
      );
      return completionStream;
    },
    async answerQuestionAwaited({
      messages,
      toolCallOptions,
    }: LlmAnswerQuestionParams) {
      const {
        choices: [choice],
      } = await openAiClient.getChatCompletions(deployment, messages, {
        ...openAiLmmConfigOptions,
        functionCall: toolCallOptions,
        functions: tools?.map((tool) => tool.definition),
      });
      const { message } = choice;
      if (!message) {
        throw new Error("No message returned from OpenAI");
      }
      return message as ChatRequestAssistantMessage;
    },
    async callTool({ messages, conversation, dataStreamer, request }) {
      const lastMessage = messages[messages.length - 1];
      // Only call tool if the message is an assistant message with a function call.
      assert(
        lastMessage.role === "assistant" &&
          lastMessage.functionCall !== undefined,
        `Message must be a tool call`
      );
      assert(
        Object.keys(toolDict).includes(lastMessage.functionCall.name),
        `Tool not found`
      );

      const { functionCall } = lastMessage;
      const tool = toolDict[functionCall.name];
      const toolResponse = await tool.call({
        functionArgs: JSON.parse(functionCall.arguments),
        conversation,
        dataStreamer,
        request,
      });
      return toolResponse;
    },
  };
}
