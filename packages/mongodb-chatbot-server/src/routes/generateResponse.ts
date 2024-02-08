import { References } from "mongodb-rag-core";
import { ChatCompletionRequestMessageFunctionCall } from "openai";
import {
  ChatLlm,
  SomeMessage,
  DataStreamer,
  Conversation,
  escapeNewlines,
  OpenAiChatMessage,
  AssistantMessage,
} from "../services";
import { logRequest } from "../utils";
import { ApiMessage } from "./conversations/utils";
import { Response as ExpressResponse } from "express";

interface GenerateResponseParams {
  shouldStream: boolean;
  llm: ChatLlm;
  llmConversation: OpenAiChatMessage[];
  dataStreamer: DataStreamer;
  res: ExpressResponse<ApiMessage>;
  references?: References;
  reqId: string;
  llmNotWorkingMessage: string;
  noRelevantContentMessage: string;
  conversation?: Conversation;
}

interface GenerateResponseReturnValue {
  messages: SomeMessage[];
}

/**
  Generate a response with/without streaming. Supports tool calling
  and standard response generation.
 */
export async function generateResponse({
  shouldStream,
  llm,
  llmConversation,
  dataStreamer,
  res,
  references,
  reqId,
  llmNotWorkingMessage,
  noRelevantContentMessage,
  conversation,
}: GenerateResponseParams): Promise<GenerateResponseReturnValue> {
  // Make copy so not mutating original object in the helper methods
  if (shouldStream) {
    return await streamGenerateResponse({
      dataStreamer,
      res,
      references,
      reqId,
      llm,
      llmConversation,
      noRelevantContentMessage,
    });
  } else {
    return await awaitGenerateResponse({
      references,
      reqId,
      llm,
      llmConversation,
      llmNotWorkingMessage,
      conversation,
      noRelevantContentMessage,
    });
  }
}

export type AwaitGenerateResponseParams = Omit<
  GenerateResponseParams,
  "shouldStream" | "dataStreamer" | "res"
>;

export async function awaitGenerateResponse({
  reqId,
  llmConversation,
  llm,
  conversation,
  references,
  llmNotWorkingMessage,
  noRelevantContentMessage,
}: AwaitGenerateResponseParams): Promise<GenerateResponseReturnValue> {
  const newMessages: SomeMessage[] = [];
  const outputReferences: References = references ?? [];
  let llmCallBehavior = undefined;
  let keepAnswering = true;
  try {
    while (keepAnswering) {
      [...llmConversation, ...newMessages];
      logRequest({
        reqId,
        message: `All messages for LLM: ${JSON.stringify(llmConversation)}`,
      });
      const answer = await llm.answerQuestionAwaited({
        messages: [...llmConversation, ...newMessages],
        toolCallOptions: llmCallBehavior,
      });
      logRequest({
        reqId,
        message: `LLM response: ${JSON.stringify(answer)}`,
      });
      newMessages.push(convertMessageFromLlmToDb(answer));
      // LLM responds with a message for user
      if (!answer.name) {
        keepAnswering = false;
      }
      // LLM responds with tool call
      else {
        const toolAnswer = await llm.callTool({
          messages: [...llmConversation, ...newMessages],
          conversation,
        });
        logRequest({
          reqId,
          message: `LLM tool call: ${JSON.stringify(toolAnswer)}`,
        });
        const {
          functionMessage,
          references: toolReferences,
          rejectUserQuery,
          subsequentLlmCall,
        } = toolAnswer;
        newMessages.push(convertMessageFromLlmToDb(functionMessage));
        // Stop looping and return static response if query rejected
        if (rejectUserQuery) {
          keepAnswering = false;
          newMessages.push({
            role: "assistant",
            content: noRelevantContentMessage,
          });
        }
        if (toolReferences) {
          outputReferences.push(...toolReferences);
        }
        llmCallBehavior = subsequentLlmCall;
      }
    }
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : JSON.stringify(err);
    logRequest({
      reqId,
      message: `LLM error: ${errorMessage}`,
      type: "error",
    });
    logRequest({
      reqId,
      message: "Only sending vector search results to user",
    });
    const llmNotWorkingResponse = {
      role: "assistant",
      content: llmNotWorkingMessage,
      references,
    } satisfies SomeMessage;
    newMessages.push(llmNotWorkingResponse);
  }

  // Add references to the last assistant message
  (newMessages[newMessages.length - 1] as AssistantMessage).references =
    references;

  return { messages: newMessages };
}

export async function streamGenerateResponse({
  dataStreamer,
  res,
  llm,
  llmConversation,
  reqId,
  references: inputReferences,
}: Omit<
  GenerateResponseParams,
  "shouldStream" | "llmNotWorkingMessage"
>): Promise<GenerateResponseReturnValue> {
  dataStreamer.connect(res);
  const newMessages: SomeMessage[] = [];
  const references: References = inputReferences ?? [];
  let llmCallBehavior = undefined;
  let keepAnswering = true;
  // TODO: have some logic to short circuit looping...a function or maybe just x num tool calls?
  while (keepAnswering) {
    const answerStream = await llm.answerQuestionStream({
      messages: llmConversation,
      toolCallOptions: llmCallBehavior,
    });
    // TODO: consolidate these two into 1 type for the assistant message that will get made
    const assistantMessage: AssistantMessage = {
      role: "assistant",
      content: "",
    };
    const functionCallContent = {
      name: "",
      arguments: "",
    } satisfies ChatCompletionRequestMessageFunctionCall;

    for await (const event of answerStream) {
      if (event.choices.length === 0) {
        continue;
      }
      // The event could contain many choices, but we only want the first one
      const choice = event.choices[0];

      // Assistant response to user (stop loop)
      if (choice.delta?.content) {
        keepAnswering = false;
        const content = escapeNewlines(choice.delta.content ?? "");
        dataStreamer.streamData({
          type: "delta",
          data: content,
        });
        assistantMessage.content += content;
        assistantMessage.references = references;
      }
      // Tool call (keep looping)
      else if (choice.delta?.functionCall) {
        if (choice.delta?.functionCall.name) {
          functionCallContent.name += escapeNewlines(
            choice.delta?.functionCall.name ?? ""
          );
        }
        if (choice.delta?.functionCall.name) {
          functionCallContent.name += escapeNewlines(
            choice.delta?.functionCall.arguments ?? ""
          );
        }
        // TODO: do more stuff here
        // also need some logic to add the full function message to the conversation
      } else if (choice.message) {
        logRequest({
          reqId,
          message: `Unexpected message in stream: no delta. Message: ${JSON.stringify(
            choice.message
          )}`,
          type: "warn",
        });
      }
    }
    if (functionCallContent.name) {
      assistantMessage.functionCall = functionCallContent;
    }
    logRequest({
      reqId,
      message: `LLM response: ${JSON.stringify(assistantMessage)}`,
    });
  }
  dataStreamer.streamData({
    type: "references",
    data: references,
  });
  // TODO: make sure that references on the last message
  return { messages: newMessages };
}
export function convertMessageFromLlmToDb(
  message: OpenAiChatMessage
): SomeMessage {
  return {
    ...message,
    content: message.content ?? "",
  };
}
