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

  const rating = evalAssistantMessage.rating;
  const comment = evalAssistantMessage.userComment;

  return {
    conversationId: conversationId,
    tags,
    rejectQuery,
    isVerifiedAnswer,
    llmDoesNotKnow,
    numRetrievedChunks,
    contextContent,
    userMessage: previousUserMessage,
    userMessageIndex: previousUserMessageIdx,
    assistantMessage: evalAssistantMessage,
    assistantMessageIndex: evalAssistantMessageIdx,
    rating,
    comment,
  };
}

export function getContextsFromMessages(
  messages: Message[],
  reqId: string
): { text: string; url: string }[] {
  const toolCallMessage: DbMessage<ToolMessage> | undefined = messages.find(
    (m): m is DbMessage<ToolMessage> =>
      m.role === "tool" && m.name === SEARCH_TOOL_NAME
  );
  if (!toolCallMessage) {
    return [];
  }
  try {
    const { results } = JSON.parse(toolCallMessage.content);
    const toolCallResult = results.map((cc: any) => ({
      text: cc.text,
      url: cc.url,
    }));
    return toolCallResult;
  } catch (e) {
    logRequest({
      reqId,
      message: `Error getting context from messages: ${e}`,
      type: "error",
    });
    return [];
  }
}
