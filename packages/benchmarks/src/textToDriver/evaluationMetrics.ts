import { TextToDriverEvalScorer } from "./evalTypes";
// import { fuzzyMatch } from "./fuzzyMatch";

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
