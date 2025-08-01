import {
  computeNormalizedLogarithmicQueryEfficiency,
  computeNormalizedLogisticalExecutionTime,
  fuzzyMatchExecutionResults,
  isNonEmptyResult,
  isReasonableResult,
  profileMongoshQuery,
} from "mongodb-rag-core/executeCode";
import { TextToDriverEvalScorer } from "./TextToDriverEval";
import { Score } from "autoevals";

/**
  Check if the generated query successfully executed.
  Note that if the query isn't valid, then the "SuccessfulExecution"
  metric will always fail.
 */
export const SuccessfulExecution: TextToDriverEvalScorer = async ({
  output,
  expected,
  metadata,
}): Promise<Score[]> => {
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
}): Score[] => {
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

  const scores: Score[] = [
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
  return scores;
};

export function makeQueryPerformanceMongosh(
  connectionUri: string
): TextToDriverEvalScorer {
  return async function QueryPerformance({ output, input }) {
    const { profile, error: profileError } = await profileMongoshQuery(
      output.generatedCode,
      input.databaseName,
      connectionUri
    );

    // Do not return scores if the query profiling failed
    if (profileError) {
      return {
        name: "QueryPerformance",
        score: null,
        metadata: { error: profileError.message },
      };
    }

    const efficiency = computeNormalizedLogarithmicQueryEfficiency({
      nExamined: profile.explainOutput.executionStats.totalDocsExamined,
      nReturned: profile.explainOutput.executionStats.nReturned,
      nTotal: profile.collection.documentCount,
    });
    return {
      name: "QueryPerformance",
      score: efficiency,
      metadata: { ...profile },
    };
  };
}

export const makeMongoshBenchmarkMetrics = (
  connectionUri: string
): TextToDriverEvalScorer => {
  const compoundScorer: TextToDriverEvalScorer = async (args) => {
    const successfulExecution = (await SuccessfulExecution(args)) as Score[];
    const reasonableOutput = (await ReasonableOutput(args)) as Score[];

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
