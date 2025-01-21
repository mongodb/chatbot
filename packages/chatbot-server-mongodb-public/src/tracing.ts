import { AppConfig } from "mongodb-chatbot-server";
import { SomeMessage, UserMessage } from "mongodb-rag-core";
import { llmDoesNotKnowMessage } from "./systemPrompt";
import { strict as assert } from "assert";
import { ContextRelevancy, AnswerRelevancy, Faithfulness } from "autoevals";
import { traced } from "mongodb-rag-core/braintrust";

export const makeAddMessageToConversationUpdateTrace: (
  k: number,
  llmAsAJudge?: LlmAsAJudge
) => AppConfig["conversationsRouterConfig"]["addMessageToConversationUpdateTrace"] = (
  k,
  llmAsAJudge
) => {
  return async function ({ traceId, addedMessages, logger }) {
    const tracingData = extractTracingData(addedMessages);
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

export function extractTracingData(messages: SomeMessage[]) {
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
