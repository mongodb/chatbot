import { Faithfulness, AnswerRelevancy, ContextRelevancy } from "autoevals";
import { traced, wrapTraced } from "mongodb-rag-core/braintrust";
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

interface ScorerArgs {
  input: string;
  output: string;
  context: string[] | undefined;
  judgeModel: string;
  judgeEmbeddingModel: string;
}

const makeEvaluateWithLlmAsAJudge = (
  openAiConfig: LlmAsAJudge["openAiConfig"]
) =>
  wrapTraced(
    async function ({
      input,
      output,
      context,
      judgeEmbeddingModel,
      judgeModel,
    }: ScorerArgs) {
      return Promise.all([
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
      ]);
    },
    {
      name: "LlmAsAJudge",
    }
  );

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
    .filter((value): value is string => typeof value === "string");

  const evaluateWithLlmAsAJudge = makeEvaluateWithLlmAsAJudge(openAiConfig);

  const [faithfulness, answerRelevancy, contextRelevancy] = context
    ? await evaluateWithLlmAsAJudge({
        input,
        output,
        context,
        judgeModel,
        judgeEmbeddingModel,
      })
    : [nullScore, nullScore, nullScore];

  return {
    Faithfulness: faithfulness.score,
    AnswerRelevancy: answerRelevancy.score,
    ContextRelevancy: contextRelevancy.score,
  };
}
