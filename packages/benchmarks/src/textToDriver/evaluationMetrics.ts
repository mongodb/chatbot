import { TextToDriverEvalScorer } from "./evalTypes";
import { fuzzyMatch } from "./fuzzyMatch";

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
    score: null,
  };
  try {
    const isFuzzyMatch =
      output.execution.result !== null
        ? fuzzyMatch({
            mongoDbOutput: output.execution.result,
            expected: expected,
            orderMatters: metadata.sql.query.includes("ORDER BY"),
            isAggregation:
              metadata.sql.tags?.subcategories.includes("AGGREGATION") ?? false,
          })
        : null;
    if (isFuzzyMatch !== null) {
      correctOutputFuzzy.score = isFuzzyMatch ? 1 : 0;
    } else {
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
  Number of milliseconds it took to execute the driver code.
 */
export const QueryRunTimeMs: TextToDriverEvalScorer = ({ output }) => {
  return {
    name: "QueryRunTimeMs",
    score: output.execution.executionTimeMs,
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
