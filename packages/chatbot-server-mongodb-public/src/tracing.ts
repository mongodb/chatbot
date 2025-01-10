import { AppConfig } from "mongodb-chatbot-server";
import { SomeMessage, UserMessage, AssistantMessage } from "mongodb-rag-core";
import { llmDoesNotKnowMessage } from "./systemPrompt";

export const makeAddMessageToConversationUpdateTrace: (
  k: number
) => AppConfig["conversationsRouterConfig"]["addMessageToConversationUpdateTrace"] = (
  k
) =>
  async function ({ traceId, addedMessages, logger }) {
    const tracingData = extractTracingData(addedMessages);
    logger.updateSpan({
      id: traceId,
      tags: tracingData.tags,
      scores: {
        RejectedQuery: tracingData.rejectQuery === true ? 1 : null,
        VerifiedAnswer: tracingData.isVerifiedAnswer === true ? 1 : null,
        LlmDoesNotKnow: tracingData.llmDoesNotKnow === true ? 1 : null,
        [`RetrievedChunksOver${k}`]:
          tracingData.isVerifiedAnswer !== true
            ? tracingData.numRetrievedChunks / k
            : null,
      },
    });
  };

function extractTracingData(messages: SomeMessage[]) {
  const latestUserMessage = messages.findLast(
    (message) => message.role === "user"
  ) as UserMessage | undefined;
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

  const latestAssistantMessage = messages.findLast(
    (message) => message.role === "assistant"
  );

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
  };
}

function tagify(s: string) {
  return s.replaceAll(/ /g, "_").toLowerCase();
}
