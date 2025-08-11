import { Score } from "autoevals";
import {
  TextToDriverEvalScorer,
  TextToDriverExpected,
  TextToDriverOutput,
} from "../TextToDriverEval";
import {
  makeQueryPerformanceMongosh,
  SuccessfulExecution,
} from "./evaluationMetrics";
// SuccessfulExecution: Evaluate if the task generates MQL code that successfully executes. 1.0 if successful, otherwise 0.0.
// NonEmptyOutput: Measure whether the generated query returns documents.Can check length of output array. 1 if >0, 0.0 otherwise.
// OperatorUsed: Use regex to check whether the generated query correctly uses Atlas Search operators. Partial credit of 0.5 if usedeprecated $knnBeta operator. Full credit of 1.0 if uses the current $search operator. 0.0 if neither operator is used.
// NDCG@10: Use NDCG@10 to measure if results of generated query match the expected query results. Between 0 and 1, inclusive. We already have a helper function for this, binaryNdcgAtK().

export const NonEmptyOutput = ({
  output,
}: {
  output: TextToDriverOutput;
}): Score => {
  const result = output.execution.result;
  if (result === null) {
    return {
      name: "NonEmptyOutput",
      score: 0,
    };
  }
  return {
    name: "NonEmptyOutput",
    score: Array.isArray(result) && result.length > 0 ? 1 : 0,
  };
};

export const OperatorUsed = ({
  output,
}: {
  output: TextToDriverOutput;
}): Score => {
  const generatedCode = output.generatedCode;
  const correctOperatorUsed = generatedCode.includes("$search");
  const deprecatedOperatorUsed = generatedCode.includes("$knnBeta");
  return {
    name: "OperatorUsed",
    // Correct: 1, deprecated: 0.5, incorrect: 0
    score: correctOperatorUsed ? 1 : deprecatedOperatorUsed ? 0.5 : 0,
  };
};

export const makeNdcgAtK = (k: number): TextToDriverEvalScorer => {
  return async ({ output, expected }) => {
    const result = output.execution.result;
    const ndcg = binaryNdcgAtK(result, expected);
    return { name: "NDCGAtK", score: ndcg };
  };
};

export const makeAtlasSearchBenchmarkMetrics = (
  connectionUri: string
): TextToDriverEvalScorer => {
  const compoundScorer: TextToDriverEvalScorer = async (args) => {
    const successfulExecution = SuccessfulExecution(args);

    // Note doing casting b/c of limitations of the Braintrust typing used here.
    const allScores = [...successfulExecution, ...reasonableOutput];

    // Only track performance if its the correct answer..this is so that it serves as a "bonus" metric.
    if (
      successfulExecution.find(({ name, score }) => {
        return name === "CorrectOutputFuzzy" && score !== 0;
      })
    ) {
      const queryPerformance = (await makeQueryPerformanceMongosh(
        connectionUri
      )(args)) as Score;
      console.log(queryPerformance);
      allScores.push(queryPerformance);
    }

    return allScores;
  };
  return compoundScorer;
};
