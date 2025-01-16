import { Faithfulness, AnswerRelevancy, ContextRelevancy } from "autoevals";
import { traced } from "mongodb-rag-core/braintrust";
import { extractTracingData } from "./extractTracingData";

export interface LlmAsAJudge {
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
    !tracingData.userMessage ||
    !tracingData.assistantMessage
  ) {
    return;
  }
  const input = tracingData.userMessage.content;
  const output = tracingData.assistantMessage.content;
  const context = tracingData.userMessage.contextContent
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
