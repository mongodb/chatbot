import { Message, UserMessage, AssistantMessage } from "mongodb-rag-core";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { llmDoesNotKnowMessage } from "../systemPrompt";

export function extractTracingData(
  messages: Message[],
  userMessageId: ObjectId
) {
  const latestUserMessageIdx = messages.findLastIndex(
    (message) => message.role === "user" && message.id.equals(userMessageId)
  );
  const latestUserMessage = messages[latestUserMessageIdx] as
    | UserMessage
    | undefined;
  const latestAssistantMessage = messages
    .slice(latestUserMessageIdx)
    .find(
      (message) => message.role === "assistant" && message.content !== undefined
    ) as AssistantMessage | undefined;

  const tags = [];

  const rejectQuery = latestUserMessage?.rejectQuery;
  if (rejectQuery === true) {
    tags.push("rejected_query");
  }
  const programmingLanguage = latestUserMessage?.customData
    ?.programmingLanguage as string | undefined;
  const mongoDbProduct = latestUserMessage?.customData?.mongoDbProduct as
    | string
    | undefined;
  if (programmingLanguage) {
    tags.push(tagify(programmingLanguage));
  }
  if (mongoDbProduct) {
    tags.push(tagify(mongoDbProduct));
  }

  const numRetrievedChunks = latestUserMessage?.contextContent?.length ?? 0;
  if (numRetrievedChunks === 0) {
    tags.push("no_retrieved_content");
  }

  const isVerifiedAnswer =
    latestAssistantMessage?.metadata?.verifiedAnswer !== undefined
      ? true
      : undefined;
  if (isVerifiedAnswer) {
    tags.push("verified_answer");
  }

  const llmDoesNotKnow = latestAssistantMessage?.content.includes(
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
    latestUserMessage,
    latestAssistantMessage,
  };
}

function tagify(s: string) {
  return s.replaceAll(/ /g, "_").toLowerCase();
}
