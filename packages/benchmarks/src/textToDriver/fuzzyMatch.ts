import { Document } from "mongodb-rag-core";
import { EJSON } from "bson";
import { strict as assert } from "assert";

type MongoDbOutput = Document | number | Document[];

export interface FuzzyMatchParams {
  mongoDbOutput: MongoDbOutput;
  expected: string;
  /**
    If true, the order of elements in arrays matters.
    @default false
   */
  orderMatters?: boolean;
  /**
    If true, the output is an aggregation operation.
    Handled differently.
    The fuzzy matcher only handles aggregations that return a single document.
    @default false
   */
  isAggregation?: boolean;
  /**
    The allowed difference between numbers for fuzzy matching.
    @default 0.01
   */
  allowedNumberDifference?: number;
}

export const ERRORS = {
  EXPECTED_ARRAY: "Expected value must be an array",
  SINGLE_ITEM_ARRAY:
    "Expected value and output value must both be a single document arrays",
};

export const fuzzyMatchScalarKey = "__output__";

export function fuzzyMatch({
  mongoDbOutput,
  expected,
  orderMatters = false,
  isAggregation = false,
  allowedNumberDifference = 0.01,
}: FuzzyMatchParams): boolean | null {
  const outputEjson = EJSON.serialize(mongoDbOutput, { relaxed: true });
  const expectedEjson = EJSON.parse(expected, { relaxed: true });

  const outputIsArray = Array.isArray(outputEjson);
  const expectedIsArray = Array.isArray(expectedEjson);

  assert(expectedIsArray, ERRORS.EXPECTED_ARRAY);

  if (isAggregation) {
    return fuzzyMatchAggregation(
      expectedEjson,
      outputEjson,
      allowedNumberDifference
    );
  }

  if (outputIsArray && expectedIsArray) {
    return fuzzyMatchArrays(
      expectedEjson,
      outputEjson,
      orderMatters,
      allowedNumberDifference
    );
  }
  // TODO: handle other types
  return null;
}

export function fuzzyMatchAggregation(
  truthArray: Record<string, unknown>[],
  testInput: MongoDbOutput,
  allowedNumberDifference = 0.01
): boolean {
  const testIsArray = Array.isArray(testInput);
  assert(
    truthArray.length === 1 &&
      // Output must be a single document array
      // or not an array at all
      (testIsArray ? testInput.length === 1 : true),
    ERRORS.SINGLE_ITEM_ARRAY
  );
  const testToEvaluate = testIsArray
    ? testInput[0]
    : typeof testInput === "object"
    ? testInput
    : {
        [fuzzyMatchScalarKey]: testInput,
      };
  const truthToEvaluate = truthArray[0];

  // When the output is a scalar, the truth must be a scalar
  // However due to the way the data is structured,
  // the truth is always an object, like { "count(*)": 11 }.
  // So we need to check if the output is a scalar and the truth is an object.
  if (testToEvaluate[fuzzyMatchScalarKey] !== undefined) {
    const aggregationTruthKeys = Object.keys(truthToEvaluate);
    if (aggregationTruthKeys.length === 1) {
      return fuzzyMatchObjects(
        {
          [fuzzyMatchScalarKey]: truthToEvaluate[aggregationTruthKeys[0]],
        },
        testToEvaluate,
        false,
        allowedNumberDifference
      );
    }
  }
  return fuzzyMatchObjects(
    truthToEvaluate,
    testToEvaluate,
    false,
    allowedNumberDifference
  );
}

/**
  Performs a fuzzy match between two arrays of objects.

  @param truthArray - The array of objects to match against
  @param testArray - The array of objects to test
 */
export function fuzzyMatchArrays(
  truthArray: Array<Record<string, unknown>>,
  testArray: Array<Record<string, unknown>>,
  orderMatters?: boolean,
  allowedNumberDifference?: number
): boolean {
  // If array lengths are different, they can't match
  if (truthArray.length !== testArray.length) return false;

  // If order matters, compare each object in order
  if (orderMatters) {
    for (let i = 0; i < truthArray.length; i++) {
      if (
        !fuzzyMatchObjects(
          truthArray[i],
          testArray[i],
          orderMatters,
          allowedNumberDifference
        )
      ) {
        return false;
      }
    }
    return true;
  }

  // Create a copy of array2 to keep track of matched objects
  const testArrayCopy = [...testArray];

  // Iterate through each object in array1
  for (const truthObj of truthArray) {
    // Find the index of a matching object in testArrayCopy
    const matchIndex = testArrayCopy.findIndex((testObj) =>
      fuzzyMatchObjects(
        truthObj,
        testObj,
        orderMatters,
        allowedNumberDifference
      )
    );

    if (matchIndex === -1) {
      // No matching object found
      return false;
    } else {
      // Remove the matched object to prevent duplicate matching
      testArrayCopy.splice(matchIndex, 1);
    }
  }

  // All objects matched
  return true;
}

/**
  Fuzzy comparison function for two objects.
  Allow small differences in numeric values.
  Only validates keys present in the truth object.
 */
function fuzzyMatchObjects(
  truthObject: Record<string, unknown>,
  testObject: Record<string, unknown>,
  nestedArrayOrderMatters?: boolean,
  allowedNumberDifference = 0.01
) {
  const truthKeys = Object.keys(truthObject);

  for (const key of truthKeys) {
    if (!Object.prototype.hasOwnProperty.call(testObject, key)) {
      return false;
    }

    const truthVal = truthObject[key];
    const testVal = testObject[key];

    // Fuzzy conditions:
    // - If values are numbers, allow a small difference
    if (typeof truthVal === "number" && typeof testVal === "number") {
      const difference = Math.abs(truthVal - testVal);
      const allowedDifference = allowedNumberDifference;
      if (difference > allowedDifference) return false;
    }
    // If values are arrays, recursively call fuzzyMatchArrays
    else if (Array.isArray(truthVal) && Array.isArray(testVal)) {
      if (!fuzzyMatchArrays(truthVal, testVal, nestedArrayOrderMatters))
        return false;
    }
    // Handle null values explicitly to allow for
    // typeof object test below, b/c null is typeof object in JS :(
    else if (truthVal === null) {
      if (testVal !== null) return false;
    }
    // Nested objects
    else if (typeof truthVal === "object" && typeof testVal === "object") {
      if (
        !fuzzyMatchObjects(
          truthVal as Record<string, unknown>,
          testVal as Record<string, unknown>,
          nestedArrayOrderMatters
        )
      )
        return false;
    } else {
      // For other types, use strict equality
      if (truthVal !== testVal) return false;
    }
  }

  return true;
}
