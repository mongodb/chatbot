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
import { strict as assert } from "assert";

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
  if (shouldStream) {
    return await streamGenerateResponse({
      dataStreamer,
      res,
      references,
      reqId,
      llm,
      llmConversation,
      noRelevantContentMessage,
      llmNotWorkingMessage,
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
  const outputReferences: References = [];

  if (references) {
    outputReferences.push(...references);
  }

  try {
    logRequest({
      reqId,
      message: `All messages for LLM: ${JSON.stringify(llmConversation)}`,
    });
    const answer = await llm.answerQuestionAwaited({
      messages: llmConversation,
    });
    newMessages.push(convertMessageFromLlmToDb(answer));

    // LLM responds with tool call
    if (answer?.functionCall) {
      assert(
        llm.callTool,
        "You must implement the callTool() method on your ChatLlm to access this code."
      );
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
      } = toolAnswer;
      newMessages.push(convertMessageFromLlmToDb(functionMessage));
      // Update references from tool call
      if (toolReferences) {
        outputReferences.push(...toolReferences);
      }
      // Return static response if query rejected
      if (rejectUserQuery) {
        newMessages.push({
          role: "assistant",
          content: noRelevantContentMessage,
        });
      } // Otherwise respond with LLM again
      else {
        const answer = await llm.answerQuestionAwaited({
          messages: [...llmConversation, ...newMessages],
          // Only allow 1 tool call per user message.
          toolCallOptions: "none",
        });
        newMessages.push(convertMessageFromLlmToDb(answer));
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
    } satisfies AssistantMessage;
    newMessages.push(llmNotWorkingResponse);
  }
  // Add references to the last assistant message
  (newMessages[newMessages.length - 1] as AssistantMessage).references =
    outputReferences;

  return { messages: newMessages };
}

export async function streamGenerateResponse({
  dataStreamer,
  res,
  llm,
  llmConversation,
  conversation,
  reqId,
  references,
  noRelevantContentMessage,
  llmNotWorkingMessage,
}: Omit<
  GenerateResponseParams,
  "shouldStream"
>): Promise<GenerateResponseReturnValue> {
  dataStreamer.connect(res);
  const newMessages: SomeMessage[] = [];
  const outputReferences: References = [];

  if (references) {
    outputReferences.push(...references);
  }
  try {
    const answerStream = await llm.answerQuestionStream({
      messages: llmConversation,
    });
    const initialAssistantMessage: AssistantMessage = {
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

      // Assistant response to user
      if (choice.delta?.content) {
        const content = escapeNewlines(choice.delta.content ?? "");
        dataStreamer.streamData({
          type: "delta",
          data: content,
        });
        initialAssistantMessage.content += content;
      }
      // Tool call
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
    const shouldCallTool = functionCallContent.name !== "";
    if (shouldCallTool) {
      initialAssistantMessage.functionCall = functionCallContent;
    }
    newMessages.push(initialAssistantMessage);

    logRequest({
      reqId,
      message: `LLM response: ${JSON.stringify(initialAssistantMessage)}`,
    });
    // Tool call
    if (shouldCallTool) {
      assert(
        llm.callTool,
        "You must implement the callTool() method on your ChatLlm to access this code."
      );
      const {
        functionMessage,
        references: toolReferences,
        rejectUserQuery,
      } = await llm.callTool({
        messages: [...llmConversation, ...newMessages],
        conversation,
        dataStreamer,
      });

      if (rejectUserQuery) {
        newMessages.push({
          role: "assistant",
          content: noRelevantContentMessage,
        });
        dataStreamer.streamData({
          type: "delta",
          data: noRelevantContentMessage,
        });
      } else {
        if (toolReferences) {
          outputReferences.push(...toolReferences);
        }
        // TODO: handle stream and save function message

        // TODO: Handle stream and save subsequent assistant message
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
    } satisfies AssistantMessage;
    dataStreamer.streamData({
      type: "delta",
      data: llmNotWorkingMessage,
    });
    newMessages.push(llmNotWorkingResponse);
  }

  // Stream back references
  dataStreamer.streamData({
    type: "references",
    data: outputReferences,
  });

  // Add references to the last assistant message
  (newMessages[newMessages.length - 1] as AssistantMessage).references =
    outputReferences;

  return { messages: newMessages };
}
export function convertMessageFromLlmToDb(
  message: OpenAiChatMessage
): SomeMessage {
  return {
    ...message,
    content: message?.content ?? "",
  };
}
