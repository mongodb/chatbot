import {
  AssistantMessage,
  DbMessage,
  Message,
  MessageBase,
  UserMessage,
} from "mongodb-rag-core";
import { llmDoesNotKnowMessage } from "./systemPrompt";
import { strict as assert } from "assert";
import { ContextRelevancy, AnswerRelevancy, Faithfulness } from "autoevals";
import { traced } from "mongodb-rag-core/braintrust";
import { UpdateTraceFunc } from "mongodb-chatbot-server";
import { ObjectId } from "mongodb-rag-core/mongodb";

export const makeAddMessageToConversationUpdateTrace: (
  k: number,
  llmAsAJudge?: LlmAsAJudge & {
    /**
    Percent of numbers to judge. Between 0 and 1.
   */
    percentToJudge: number;
  }
) => UpdateTraceFunc = (k, llmAsAJudge) => {
  return async function ({ traceId, conversation, logger }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId)
    );
    const judges = shouldJudge(llmAsAJudge?.percentToJudge);

    logger.updateSpan({
      id: traceId,
      tags: tracingData.tags,
      scores: {
        ...getTracingScores(tracingData, k),
        ...(judges && llmAsAJudge
          ? await getLlmAsAJudgeScores(llmAsAJudge, tracingData)
          : undefined),
      },
    });
  };
};

export function makeRateMessageUpdateTrace(
  llmAsAJudge: LlmAsAJudge
): UpdateTraceFunc {
  return async function ({ traceId, conversation, logger }) {
    logger.updateSpan({
      id: traceId,
      scores: await getLlmAsAJudgeScores(
        llmAsAJudge,
        extractTracingData(
          conversation.messages,
          ObjectId.createFromHexString(traceId)
        )
      ),
    });
  };
}

function shouldJudge(percentToJudge: number | undefined): boolean {
  if (percentToJudge === undefined) {
    return false;
  }
  assert(
    percentToJudge >= 0 && percentToJudge <= 1,
    `percentToJudge must be between 0 and 1. Received: ${percentToJudge}`
  );
  return Math.random() < percentToJudge;
}

export function extractTracingData(
  messages: Message[],
  assistantMessageId: ObjectId
) {
  const evalAssistantMessageIdx = messages.findLastIndex(
    (message) =>
      message.role === "assistant" && message.id.equals(assistantMessageId)
  );
  assert(evalAssistantMessageIdx !== -1, "Assistant message not found");
  const evalAssistantMessage = messages[evalAssistantMessageIdx] as
    | DbMessage<AssistantMessage>
    | undefined;

  const previousUserMessage = messages
    .slice(0, evalAssistantMessageIdx)
    .findLast((m): m is DbMessage<UserMessage> => m.role === "user");

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
  if (programmingLanguage) {
    tags.push(tagify(programmingLanguage));
  }
  if (mongoDbProduct) {
    tags.push(tagify(mongoDbProduct));
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

  return {
    tags,
    rejectQuery,
    isVerifiedAnswer,
    llmDoesNotKnow,
    numRetrievedChunks,
    latestUserMessage: previousUserMessage,
    latestAssistantMessage: evalAssistantMessage,
  };
}

function getTracingScores(
  tracingData: ReturnType<typeof extractTracingData>,
  k: number
) {
  return {
    RejectedQuery: tracingData.rejectQuery === true ? 1 : null,
    VerifiedAnswer: tracingData.isVerifiedAnswer === true ? 1 : null,
    LlmDoesNotKnow: tracingData.llmDoesNotKnow === true ? 1 : null,
    [`RetrievedChunksOver${k}`]:
      tracingData.isVerifiedAnswer !== true
        ? tracingData.numRetrievedChunks / k
        : null,
  };
}

interface LlmAsAJudge {
  judgeModel: string;
  judgeEmbeddingModel: string;
  openAiConfig: Pick<
    Parameters<typeof Faithfulness>[0],
    | "azureOpenAi"
    | "openAiApiKey"
    | "openAiBaseUrl"
    | "openAiDangerouslyAllowBrowser"
    | "openAiDefaultHeaders"
    | "openAiOrganizationId"
  >;
}
const nullScore = {
  score: null,
};

export async function getLlmAsAJudgeScores(
  {
    judgeModel,
    openAiConfig,
    judgeEmbeddingModel,
  }: Omit<LlmAsAJudge, "percentToJudge">,
  tracingData: ReturnType<typeof extractTracingData>
) {
  // Return if we don't have the necessary data to judge
  if (
    tracingData.isVerifiedAnswer ||
    tracingData.rejectQuery ||
    tracingData.numRetrievedChunks === 0 ||
    tracingData.llmDoesNotKnow ||
    !tracingData.latestUserMessage ||
    !tracingData.latestAssistantMessage
  ) {
    return;
  }
  const input = tracingData.latestUserMessage.content;
  const output = tracingData.latestAssistantMessage.content;
  const context = tracingData.latestUserMessage.contextContent
    ?.map((c) => c.text)
    .filter((value): value is string => typeof value === "string");

  const [faithfulness, answerRelevancy, contextRelevancy] = context
    ? await traced(
        async () =>
          Promise.all([
            traced(
              async () =>
                Faithfulness({
                  input,
                  output,
                  context,
                  model: judgeModel,
                  ...openAiConfig,
                }),
              {
                name: "Faithfulness",
              }
            ),
            traced(
              async () =>
                AnswerRelevancy({
                  input,
                  output,
                  context,
                  model: judgeModel,
                  embeddingModel: judgeEmbeddingModel,
                  ...openAiConfig,
                }),
              {
                name: "AnswerRelevancy",
              }
            ),
            traced(
              async () =>
                ContextRelevancy({
                  input,
                  output,
                  context,
                  model: judgeModel,
                  ...openAiConfig,
                }),
              {
                name: "ContextRelevancy",
              }
            ),
          ]),
        {
          name: "LlmAsAJudge",
        }
      )
    : [nullScore, nullScore, nullScore];

  return {
    Faithfulness: faithfulness.score,
    AnswerRelevancy: answerRelevancy.score,
    ContextRelevancy: contextRelevancy.score,
  };
}

function tagify(s: string) {
  return s.replaceAll(/ /g, "_").toLowerCase();
}
