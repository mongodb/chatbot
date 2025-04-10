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
    // Not null or undefined
    output.execution.executionTimeMs &&
    output.execution.executionTimeMs > 0 &&
    // Not null or undefined
    expected.executionTimeMs &&
    expected.executionTimeMs > 0;

  return [
    {
      name: "NonEmptyOutput",
      score: isNonEmpty.success ? 1 : 0,
      metadata: isNonEmpty.reason ? { reason: isNonEmpty.reason } : undefined,
    },
    {
      name: "NormalizedExecutionTimeNonEmpty",
      score:
        shouldCalculateNormalizedExecutionTime === true
          ? computeNormalizedLogisticalExecutionTime(
              // casting b/c check above
              output.execution.executionTimeMs as number,
              expected.executionTimeMs as number
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
