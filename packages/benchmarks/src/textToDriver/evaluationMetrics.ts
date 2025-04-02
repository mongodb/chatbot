import { fuzzyMatchExecutionResults } from "mongodb-rag-core/executeCode";
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
