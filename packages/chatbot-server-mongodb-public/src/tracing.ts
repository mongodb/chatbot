import { AppConfig } from "mongodb-chatbot-server";
import { AssistantMessage, Message, UserMessage } from "mongodb-rag-core";
import { llmDoesNotKnowMessage } from "./systemPrompt";
import { strict as assert } from "assert";
import { ContextRelevancy, AnswerRelevancy, Faithfulness } from "autoevals";
import { traced } from "mongodb-rag-core/braintrust";
import { UpdateTraceFunc } from "mongodb-chatbot-server/build/routes/conversations/UpdateTraceFunc";
import { ObjectId } from "mongodb-rag-core/mongodb";

export const makeAddMessageToConversationUpdateTrace: (
  k: number,
  llmAsAJudge?: LlmAsAJudge
) => UpdateTraceFunc = (k, llmAsAJudge) => {
  validatePercentToJudge(llmAsAJudge?.percentToJudge);

  return async function ({ traceId, conversation, logger }) {
    const tracingData = extractTracingData(
      conversation.messages,
      ObjectId.createFromHexString(traceId)
    );
    const shouldJudge =
      typeof llmAsAJudge?.percentToJudge === "number" &&
      Math.random() < llmAsAJudge.percentToJudge;

    logger.updateSpan({
      id: traceId,
      tags: tracingData.tags,
      scores: {
        ...getTracingScores(tracingData, k),
        ...(shouldJudge
          ? await getLlmAsAJudgeScores(llmAsAJudge, tracingData)
          : undefined),
      },
    });
  };
};

export function makeCommentMessageUpdateTrace(
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

function validatePercentToJudge(percentToJudge?: number) {
  if (percentToJudge !== undefined) {
    assert(
      percentToJudge >= 0 && percentToJudge <= 1,
      `percentToJudge must be between 0 and 1. Received: ${percentToJudge}`
    );
  }
}

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
  /**
    Percent of numbers to judge. Between 0 and 1.
   */
  percentToJudge: number;
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
    // Have to do this type casting to make it compile. Unclear why.
    .filter((c) => typeof c === "string") as string[] | undefined;

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
