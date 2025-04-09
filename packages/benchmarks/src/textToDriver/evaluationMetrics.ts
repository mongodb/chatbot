import {
  computeNormalizedLogisticalExecutionTime,
  fuzzyMatchExecutionResults,
  isNonEmptyResult,
  isReasonableResult,
} from "mongodb-rag-core/executeCode";
import { TextToDriverEvalScorer } from "./TextToDriverEval";

/**
  Check if the generated query successfully executed.
  Note that if the query isn't valid, then the "SuccessfulExecution"
  metric will always fail.
 */
export const SuccessfulExecution: TextToDriverEvalScorer = async ({
  output,
  expected,
  metadata,
}) => {
  const noOutput = output.execution.result === null;
  const successfulExecution = {
    name: "SuccessfulExecution",
    score: noOutput ? 0 : 1,
  };

  const correctOutputFuzzy: ReturnType<TextToDriverEvalScorer> = {
    name: "CorrectOutputFuzzy",
    score: 0,
  };
  try {
    const isFuzzyMatch =
      output.execution.result !== null
        ? fuzzyMatchExecutionResults({
            mongoDbOutput: output.execution.result,
            expected: expected.result,
            orderMatters: metadata.orderMatters,
            isAggregation: metadata.isAggregation,
          })
        : 0;
    correctOutputFuzzy.score = isFuzzyMatch ? 1 : 0;
    if (isFuzzyMatch === 0) {
      correctOutputFuzzy.metadata = {
        error: "Fuzzy match failed",
      };
    }
  } catch (err) {
    correctOutputFuzzy.metadata = {
      error: err,
    };
  }

  return [successfulExecution, correctOutputFuzzy];
};

/**
 Checks if the output is reasonable. Uses {@link isReasonableResult} to determine if the output is reasonable.
 */
export const ReasonableOutput: TextToDriverEvalScorer = ({
  output,
  expected,
}) => {
  const isNonEmpty = isNonEmptyResult(output.execution.result);
  const isReasonable = isReasonableResult(output.execution.result);

  const shouldCalculateNormalizedExecutionTime =
    isNonEmpty.success &&
    output.execution.executionTimeMs !== null &&
    output.execution.executionTimeMs > 0 &&
    expected.result.executionTimeMs !== null &&
    expected.result.executionTimeMs > 0;

  return [
    {
      name: "NonEmptyOutput",
      score: isNonEmpty.success ? 1 : 0,
      metadata: isNonEmpty.reason ? { reason: isNonEmpty.reason } : undefined,
    },
    {
      name: "NormalizedExecutionTimeNonEmpty",
      score: shouldCalculateNormalizedExecutionTime
        ? computeNormalizedLogisticalExecutionTime(
            output.execution.executionTimeMs as number, // casting b/c check above
            expected.result.executionTimeMs
          )
        : null,
    },
    {
      name: "ReasonableOutput",
      score: isReasonable.success ? 1 : 0,
      metadata: isReasonable.reason
        ? { reason: isReasonable.reason }
        : undefined,
    },
  ];
};
