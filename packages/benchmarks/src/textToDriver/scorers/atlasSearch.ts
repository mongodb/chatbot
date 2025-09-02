import { Score } from "autoevals";
import {
  TextToDriverEvalScorer,
  TextToDriverOutput,
} from "../TextToDriverEval";
import { SuccessfulExecution } from "./evaluationMetrics";
import { binaryNdcgAtK, MatchFunc } from "mongodb-rag-core/eval";
import { ObjectId } from "mongodb-rag-core/mongodb";

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
  const isArray = Array.isArray(result);
  const hasItems = isArray && result.length > 0;
  const nonEmptyItems =
    hasItems &&
    result.every(
      (item) =>
        item !== null &&
        item !== undefined &&
        item !== "" &&
        (typeof item === "object" ? Object.keys(item).length > 0 : true)
    );
  return {
    name: metricName,
    score: isArray && hasItems && nonEmptyItems ? 1 : 0,
    metadata: {
      isArray,
      hasItems,
      nonEmptyItems,
    },
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

interface MatchableDocument {
  _id?: string | ObjectId | number;
  id?: string | number;
  [key: string]: unknown;
}
export const ndcgMatchFunc: MatchFunc<MatchableDocument> = (
  a: MatchableDocument,
  b: MatchableDocument
) => {
  if (a._id && b._id) {
    // Can't just use === for ObjectId because it's a class.
    // Must convert to string.
    if (ObjectId.isValid(a._id) || ObjectId.isValid(b._id)) {
      return a._id.toString() === b._id.toString();
    }
    // Otherwise, it's a number or string, and we can use ===
    if (a._id === b._id) {
      return true;
    }
  }
  // If the id field is present, use it to match.
  if (a.id && b.id) {
    if (a.id === b.id) {
      return true;
    }
  }
  return false;
};

export const makeNdcgAtK = <T>({
  k,
}: {
  k: number;
}): TextToDriverEvalScorer => {
  const metricName = `NDCG@${k}`;
  return function NdcgAtK({ output, expected }): Score {
    const actualResult = output.execution.result;
    const expectedResult = expected.result;
    if (!Array.isArray(actualResult) || !Array.isArray(expectedResult)) {
      return {
        name: metricName,
        score: 0,
        metadata: { error: "Expected result and expected result to be arrays" },
      };
    }
    const ndcg = binaryNdcgAtK(actualResult, expectedResult, ndcgMatchFunc, k);
    return { name: metricName, score: ndcg };
  };
};
