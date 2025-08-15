import { Score } from "autoevals";
import {
  TextToDriverEvalScorer,
  TextToDriverOutput,
} from "../TextToDriverEval";
import { SuccessfulExecution } from "./evaluationMetrics";
import { binaryNdcgAtK, MatchFunc } from "mongodb-rag-core/eval";

export const NonEmptyArrayOutput = ({
  output,
}: {
  output: TextToDriverOutput;
}): Score => {
  const metricName = "NonEmptyArrayOutput";
  const result = output.execution.result;
  if (result === null) {
    return {
      name: metricName,
      score: 0,
    };
  }
  return {
    name: metricName,
    score: Array.isArray(result) && result.length > 0 ? 1 : 0,
  };
};

export const SearchOperatorUsed = ({
  output,
}: {
  output: TextToDriverOutput;
}): Score => {
  const generatedCode = output.generatedCode;
  const correctOperatorUsed =
    generatedCode.includes("$search") ||
    generatedCode.includes("$vectorSearch");
  const deprecatedOperatorUsed = generatedCode.includes("$knnBeta");
  return {
    name: "SearchOperatorUsed",
    // Correct: 1, deprecated: 0.5, incorrect: 0
    score: correctOperatorUsed ? 1 : deprecatedOperatorUsed ? 0.5 : 0,
  };
};

export const makeNdcgAtK = <T>({
  k,
  matchFunc,
}: {
  k: number;
  matchFunc: MatchFunc<T>;
}): TextToDriverEvalScorer => {
  const metricName = `NDCG@${k}`;
  return ({ output, expected }): Score => {
    const result = output.execution.result;
    if (!Array.isArray(result) || !Array.isArray(expected)) {
      return {
        name: metricName,
        score: 0,
        metadata: { error: "Expected result and expected result to be arrays" },
      };
    }
    const ndcg = binaryNdcgAtK(result, expected, matchFunc, k);
    return { name: metricName, score: ndcg };
  };
};
