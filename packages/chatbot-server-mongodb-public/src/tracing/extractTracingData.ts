import {
  Message,
  UserMessage,
  AssistantMessage,
  DbMessage,
} from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { llmDoesNotKnowMessage } from "../systemPrompt";
import { strict as assert } from "assert";

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

  const rejectQuery = previousUserMessage?.rejectQuery;
  if (rejectQuery === true) {
    tags.push("rejected_query");
  }
  const programmingLanguage = previousUserMessage?.customData
    ?.programmingLanguage as string | undefined;
  const mongoDbProduct = previousUserMessage?.customData?.mongoDbProduct as
    | string
    | undefined;
  const requestOriginCode = previousUserMessage?.customData?.originCode as
    | string
    | undefined;
  if (programmingLanguage) {
    tags.push(tagify(programmingLanguage));
  }
  if (mongoDbProduct) {
    tags.push(tagify(mongoDbProduct));
  }
  if (requestOriginCode) {
    tags.push(tagify(requestOriginCode));
  }

  const numRetrievedChunks = previousUserMessage?.contextContent?.length ?? 0;
  if (numRetrievedChunks === 0) {
    tags.push("no_retrieved_content");
  }

  const isVerifiedAnswer =
    evalAssistantMessage?.metadata?.verifiedAnswer !== undefined
      ? true
      : undefined;
  if (isVerifiedAnswer) {
    tags.push("verified_answer");
  }

  const llmDoesNotKnow = evalAssistantMessage?.content.includes(
    llmDoesNotKnowMessage
  );
  if (llmDoesNotKnow) {
    tags.push("llm_does_not_know");
  }

  const rating = evalAssistantMessage?.rating;
  const comment = evalAssistantMessage?.userComment;

  return {
    conversationId: conversationId,
    tags,
    rejectQuery,
    isVerifiedAnswer,
    llmDoesNotKnow,
    numRetrievedChunks,
    userMessage: previousUserMessage,
    userMessageIndex: previousUserMessageIdx,
    assistantMessage: evalAssistantMessage,
    assistantMessageIndex: evalAssistantMessageIdx,
    rating,
    comment,
  };
}

function tagify(s: string) {
  return s.replaceAll(/ /g, "_").toLowerCase();
}
