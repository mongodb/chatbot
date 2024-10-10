import { TextToDriverEvalScorer } from "./evalTypes";
import { fuzzyMatch } from "./fuzzyMatch";

/**
  Check if the generated query successfully executed
  and matches the expected output using fuzzy matching.

  Note that if the query isn't valid, then the "SuccessfulExecution"
  metric will always fail.
 */
export const CorrectOutput: TextToDriverEvalScorer = async ({
  expected,
  metadata,
  output,
}) => {
  const noOutput = output.execution.result === null;

  const successfulExecution = {
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
              metadata.sql.tags.subcategories.includes("AGGREGATION"),
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
  Number of characters in the generated driver code.
 */
export const GenerationLength: TextToDriverEvalScorer = ({ output }) => {
  return {
    name: "GenerationLength",
    score: output.generatedCode.length,
  };
};
