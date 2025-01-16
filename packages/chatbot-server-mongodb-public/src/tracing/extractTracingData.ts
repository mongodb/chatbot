import { Message, UserMessage, AssistantMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { llmDoesNotKnowMessage } from "../systemPrompt";
import { strict as assert } from "assert";

export function extractTracingData(
  messages: Message[],
  tracingMessageId: ObjectId
) {
  const relevantAssistantMessageIdx = messages.findLastIndex(
    (message) => message.role === "user" && message.id.equals(tracingMessageId)
  );
  assert(relevantAssistantMessageIdx !== -1, "Tracing message not found");

  const relevantAssistantMessage = messages[relevantAssistantMessageIdx] as
    | AssistantMessage
    | undefined;
  const precedingUserMessage = messages
    .slice(0, relevantAssistantMessageIdx)
    .findLast((m) => m.role === "user") as UserMessage | undefined;
  console.log(relevantAssistantMessage);
  const tags = [];

  const rejectQuery = precedingUserMessage?.rejectQuery;
  if (rejectQuery === true) {
    tags.push("rejected_query");
  }
  const programmingLanguage = precedingUserMessage?.customData
    ?.programmingLanguage as string | undefined;
  const mongoDbProduct = precedingUserMessage?.customData?.mongoDbProduct as
    | string
    | undefined;
  if (programmingLanguage) {
    tags.push(tagify(programmingLanguage));
  }
  if (mongoDbProduct) {
    tags.push(tagify(mongoDbProduct));
  }

  const numRetrievedChunks = precedingUserMessage?.contextContent?.length ?? 0;
  if (numRetrievedChunks === 0) {
    tags.push("no_retrieved_content");
  }

  const isVerifiedAnswer =
    relevantAssistantMessage?.metadata?.verifiedAnswer !== undefined
      ? true
      : undefined;
  if (isVerifiedAnswer) {
    tags.push("verified_answer");
  }

  const llmDoesNotKnow = relevantAssistantMessage?.content.includes(
    llmDoesNotKnowMessage
  );
  if (llmDoesNotKnow) {
    tags.push("llm_does_not_know");
  }

  return {
    tags,
    rejectQuery,
    isVerifiedAnswer,
    llmDoesNotKnow,
    numRetrievedChunks,
    userMessage: precedingUserMessage,
    assistantMessage: relevantAssistantMessage,
  };
}

function tagify(s: string) {
  return s.replaceAll(/ /g, "_").toLowerCase();
}
