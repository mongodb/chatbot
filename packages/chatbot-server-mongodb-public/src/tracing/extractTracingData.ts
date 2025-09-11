import {
  Message,
  UserMessage,
  AssistantMessage,
  DbMessage,
  ToolMessage,
} from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { llmDoesNotKnowMessage } from "../systemPrompt";
import { strict as assert } from "assert";
import { SEARCH_TOOL_NAME } from "../tools/search";
import {
  FETCH_PAGE_TOOL_NAME,
  SEARCH_ALL_FALLBACK_TEXT,
} from "../tools/fetchPage";
import { logRequest } from "../utils";
import { OriginCode } from "mongodb-chatbot-server";
import { tagify } from "./tagify";

export function extractTracingData(
  messages: Message[],
  assistantMessageId: ObjectId,
  conversationId: ObjectId
) {
  const evalAssistantMessageIdx = messages.findLastIndex(
    (message) =>
      message.role === "assistant" && message.id.equals(assistantMessageId)
  );
  assert(evalAssistantMessageIdx !== -1, "Assistant message not found");
  const evalAssistantMessage = messages[
    evalAssistantMessageIdx
  ] as DbMessage<AssistantMessage>;

  const previousUserMessageIdx = messages
    .slice(0, evalAssistantMessageIdx)
    .findLastIndex((m): m is DbMessage<UserMessage> => m.role === "user");
  assert(previousUserMessageIdx !== -1, "User message not found");
  const previousUserMessage = messages[
    previousUserMessageIdx
  ] as DbMessage<UserMessage>;

  const firstToolMetadata = getFirstToolMetadata(
    messages.slice(previousUserMessageIdx + 1, evalAssistantMessageIdx)
  );

  const tags = [];

  const rejectQuery = previousUserMessage.rejectQuery;
  if (rejectQuery === true) {
    tags.push("rejected_query");
  }

  const requestOriginCode = previousUserMessage.customData?.originCode as
    | OriginCode
    | undefined;

  if (requestOriginCode) {
    tags.push(tagify(requestOriginCode));
  }

  const contextContent = getContextsFromMessages(
    messages.slice(previousUserMessageIdx + 1, evalAssistantMessageIdx),
    assistantMessageId.toHexString()
  );
  const numRetrievedChunks = contextContent.length;
  if (numRetrievedChunks === 0) {
    tags.push("no_retrieved_content");
  }

  const isVerifiedAnswer =
    evalAssistantMessage.metadata?.verifiedAnswer !== undefined
      ? true
      : undefined;
  if (isVerifiedAnswer) {
    tags.push("verified_answer");
  }
  const llmDoesNotKnow = evalAssistantMessage.content.includes(
    llmDoesNotKnowMessage
  );
  if (llmDoesNotKnow) {
    tags.push("llm_does_not_know");
  }

  const promotionData = evalAssistantMessage.metadata?.promotions ?? undefined;
  if (promotionData) {
    tags.push("did_promotion");
  }

  const rating = evalAssistantMessage.rating;
  const comment = evalAssistantMessage.userComment;

  const maybeOrigin = previousUserMessage.customData?.origin;
  const origin = typeof maybeOrigin === "string" ? maybeOrigin : undefined;

  const maybeRejectionReason = previousUserMessage.customData?.rejectionReason;
  const rejectionReason =
    typeof maybeRejectionReason === "string"
      ? maybeRejectionReason
      : "Unknown rejection reason";
  return {
    conversationId: conversationId,
    tags,
    rejectQuery,
    rejectionReason,
    isVerifiedAnswer,
    llmDoesNotKnow,
    numRetrievedChunks,
    contextContent,
    firstToolMetadata,
    userMessage: previousUserMessage,
    userMessageIndex: previousUserMessageIdx,
    assistantMessage: evalAssistantMessage,
    assistantMessageIndex: evalAssistantMessageIdx,
    origin,
    rating,
    comment,
  };
}

export function getContextsFromMessages(
  messages: Message[],
  reqId: string
): { text: string; url: string }[] {
  const contexts: { text: string; url: string }[] = [];

  messages.forEach((message, idx) => {
    if (message.role !== "tool") return;
    const toolResponseMessage = message as DbMessage<ToolMessage>;
    try {
      if (toolResponseMessage.name === SEARCH_TOOL_NAME) {
        const toolResult = JSON.parse(toolResponseMessage.content);
        const { results } = toolResult;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const toolCallResult = results.map((contextContent: any) => ({
          text: contextContent.text,
          url: contextContent.url,
        }));
        contexts.push(...toolCallResult);
      } else if (toolResponseMessage.name === FETCH_PAGE_TOOL_NAME) {
        // Fetch_page does not return URL in the LLM input, so get it from the tool call
        const assistantToolCallMessage = messages[
          idx - 1
        ] as DbMessage<AssistantMessage>;
        const toolCall = assistantToolCallMessage?.toolCall;
        if (!toolCall || toolCall.type !== "function") {
          throw new Error("No function call in response from OpenAI");
        }
        const url = toolCall.function.arguments
          ? JSON.parse(toolCall.function.arguments).pageUrl
          : undefined;
        if (
          url === undefined ||
          !toolResponseMessage.content ||
          toolResponseMessage.content === "{}" ||
          toolResponseMessage.content === SEARCH_ALL_FALLBACK_TEXT
        ) {
          logRequest({
            reqId,
            message: `No context found by ${FETCH_PAGE_TOOL_NAME} tool`,
            type: "info",
          });
          return;
        }
        contexts.push({ text: toolResponseMessage.content, url });
      }
    } catch (e) {
      logRequest({
        reqId,
        message: `Error getting context from messages: ${e}`,
        type: "error",
      });
    }
  });

  return contexts;
}

export const getFirstToolMetadata = (
  messages: Message[]
): { name: string; [key: string]: string } | null => {
  for (const message of messages) {
    if (
      message.role === "assistant" &&
      message.toolCall &&
      message.toolCall.type === "function"
    ) {
      try {
        const toolCallArgs = message.toolCall?.function.arguments
          ? JSON.parse(message.toolCall?.function.arguments)
          : {};
        return {
          name: message.toolCall?.function.name,
          ...toolCallArgs,
        };
      } catch (e) {
        return { name: "unknown" };
      }
    }
  }
  return null;
};
