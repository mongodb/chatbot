import OpenAI from "openai";
import { strict as assert } from "assert";
import { ChatLlm, LlmAnswerQuestionParams, Tool } from "./ChatLlm";

/**
  Configuration for the {@link makeOpenAiChatLlm} function.
 */
export interface MakeOpenAiChatLlmParams {
  deployment: string;
  openAiClient: OpenAI;
  openAiLmmConfigOptions?: Omit<
    OpenAI.ChatCompletionCreateParams,
    "model" | "messages"
  >;
  tools?: Tool[];
}

/**
  Construct the {@link ChatLlm} service using the [OpenAI client](https://www.npmjs.com/package/openai).
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
      const completionStream = await openAiClient.chat.completions.create({
        model: deployment,
        messages,
        ...(openAiLmmConfigOptions ?? {}),
        ...(toolCallOptions ? { function_call: toolCallOptions } : {}),
        functions: tools?.map((tool) => tool.definition),
        stream: true,
      });
      return completionStream;
    },
    async answerQuestionAwaited({
      messages,
      toolCallOptions,
    }: LlmAnswerQuestionParams) {
      const {
        choices: [choice],
      } = await openAiClient.chat.completions.create({
        model: deployment,
        messages,
        ...(openAiLmmConfigOptions ?? {}),
        ...(toolCallOptions ? { function_call: toolCallOptions } : {}),
        functions: tools?.map((tool) => tool.definition),
        stream: false,
      });
      const { message } = choice;
      if (!message) {
        throw new Error("No message returned from OpenAI");
      }
      return message;
    },
    async callTool({ messages, conversation, dataStreamer, request }) {
      const lastMessage = messages[messages.length - 1];
      // Only call tool if the message is an assistant message with a function call.
      assert(
        lastMessage.role === "assistant" &&
          lastMessage.function_call !== undefined,
        `Message must be a tool call`
      );
      assert(
        lastMessage.function_call !== null,
        `Function call must be defined`
      );
      assert(
        Object.keys(toolDict).includes(lastMessage.function_call.name),
        `Tool not found`
      );

      const { function_call } = lastMessage;
      const tool = toolDict[function_call.name];
      const toolResponse = await tool.call({
        functionArgs: JSON.parse(function_call.arguments),
        conversation,
        dataStreamer,
        request,
      });
      return toolResponse;
    },
  };
}
