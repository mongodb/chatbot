import { NlPromptResponseEvalScorer } from "./NlQuestionAnswerEval";
import { Factuality, Score } from "autoevals";
import { strict as assert } from "assert";
import { LlmOptions } from "mongodb-rag-core/executeCode";

export const makeReferenceAlignment: (
  llmOptions: LlmOptions,
  name_postfix?: string
) => NlPromptResponseEvalScorer = (llmOptions, name_postfix) =>
  async function ({ input, output, expected }) {
    const { response } = output;
    const { reference } = expected;
    const name = `ReferenceAlignment${name_postfix ? `_${name_postfix}` : ""}`;
    // Do not calculate factuality if there's no reference answer
    if (!reference) {
      return {
        score: null,
        name,
      };
    }
    const userMessage = input.messages.findLast(
      (m) => m.role === "user"
    )?.content;
    assert(userMessage, "No user message found");
    const factuality = await Factuality({
      input: userMessage,
      output: response,
      expected: reference,
      // Note: need to do the funky casting here
      // b/c of different `OpenAI` client typing
      // that is not relevant here.
      client: llmOptions.openAiClient as unknown as Parameters<
        typeof Factuality
      >[0]["client"],
      model: llmOptions.model,
    });
    return {
      ...factuality,
      name,
      score: remapFactualityScore(factuality.score),
    };
  };

function remapFactualityScore(score: number | null | undefined) {
  if (score === null || score === undefined) {
    return null;
  }
  switch (score) {
    case 0.4:
      return 0.5;
    case 0.6:
      return 0.8;
    default:
      return score;
  }
}

export const makeReferenceAlignmentCouncil: (
  llmOptions: LlmOptions[]
) => NlPromptResponseEvalScorer = (llmOptions) => {
  assert(llmOptions.length > 0, "At least one LLM must be provided");
  const factualityMetrics = llmOptions.map((llmOption) =>
    makeReferenceAlignment(llmOption)
  );
  return async function ({ input, output, expected }) {
    const name = "ReferenceAlignmentCouncil";
    const { reference } = expected;
    // Do not calculate factuality if there's no reference answer
    if (!reference) {
      return {
        score: null,
        name,
      };
    }
    const userMessage = input.messages.findLast(
      (m) => m.role === "user"
    )?.content;
    assert(userMessage, "No user message found");
    const factualityResults = (await Promise.all(
      factualityMetrics.map((metric) => metric({ input, output, expected }))
    )) as Score[];

    // Filter out null scores and calculate average
    const validScores = factualityResults
      .filter(
        (result): result is { score: number; name: string } =>
          result?.score !== null && typeof result.score === "number"
      )
      .map((result) => result.score);

    if (validScores.length !== factualityResults.length) {
      return {
        score: null,
        name,
        metadata: {
          factualityResults,
          reason: "Error computing some scores",
        },
      };
    }

    const factuality =
      validScores.reduce((acc, score) => acc + score, 0) / validScores.length;

    return {
      score: factuality,
      name,
      metadata: {
        factualityResults,
      },
    };
  };
};
