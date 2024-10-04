import { TextToDriverEvalScorer } from "./evalTypes";

/**
  Check if the generated query successfully executed.
  Note that if the query isn't valid, then the "SuccessfulExecution"
  metric will always fail.
 */
export const SuccessfulExecution: TextToDriverEvalScorer = async ({
  output,
}) => {
  const noOutput = output.execution.result === null;

  return {
    name: "SuccessfulExecution",
    score: noOutput ? 0 : 1,
    ...(output.execution.error
      ? {
          metadata: {
            error: output.execution.error,
          },
        }
      : {}),
  };
};

/**
  Measure how long the query takes to execute in minutes.

  Note: Measuring in minutes because
  Braintrust throws an error if the score > 1.
 */
export const QueryExecutionTimeMinutes: TextToDriverEvalScorer = async ({
  output,
}) => {
  const executionTimeMinutes = output.execution.executionTimeMs / 1000 / 60;

  return {
    name: "QueryExecutionTimeMinutes",
    score: executionTimeMinutes,
  };
};
