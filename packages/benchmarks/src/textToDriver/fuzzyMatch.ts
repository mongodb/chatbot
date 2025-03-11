import { Document } from "mongodb-rag-core/mongodb";
import { EJSON } from "bson";
import { strict as assert } from "assert";

export type MongoDbOutput = Document | number | Document[];

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
    Handled differently in the following ways:

    1. If MongoDB operation returns a scalar value,
       the truth must be a single object that contains that scalar value as the value of ones of its keys.
    2. If MongoDB operation returns a single object or an array of objects,
       check that the scalar _values_ of objects are the same as the expected values.
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

export const fuzzyMatchSyntheticKey = "__output__";

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
      orderMatters,
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
  return null;
}

export function fuzzyMatchAggregation(
  truthArray: Record<string, unknown>[],
  testInput: MongoDbOutput,
  nestedArrayOrderMatters: boolean,
  allowedNumberDifference = 0.01
): boolean {
  const testIsArray = Array.isArray(testInput);
  let testArray: Record<string, unknown>[];

  if (testIsArray) {
    // If testInput is an array of arrays, keep it as is to avoid flattening
    testArray = testInput as Record<string, unknown>[];
  } else if (typeof testInput === "object") {
    testArray = [testInput as Record<string, unknown>];
  } else {
    testArray = [
      {
        [fuzzyMatchSyntheticKey]: testInput,
      },
    ];
  }

  // Since order doesn't matter, we need to find a matching object for each object in truthArray
  // Create a copy of testArray to keep track of unmatched objects
  const testArrayCopy = [...testArray];

  for (const truthObj of truthArray) {
    // Try to find a matching object in testArrayCopy
    const matchIndex = testArrayCopy.findIndex((testObj) =>
      fuzzyMatchObjectsIgnoreKeys(
        truthObj,
        testObj,
        nestedArrayOrderMatters,
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

/**
  Compares two objects by their values, ignoring keys.
 */
function fuzzyMatchObjectsIgnoreKeys(
  truthObject: Record<string, unknown>,
  testObject: Record<string, unknown>,
  nestedArrayOrderMatters?: boolean,
  allowedNumberDifference = 0.01
): boolean {
  const truthValues = Object.values(truthObject);
  const testValues = Object.values(testObject);

  // If more truth values than test values, the objects can't match
  if (truthValues.length > testValues.length) return false;

  // Compare values regardless of order
  const testValuesCopy = [...testValues];

  for (const truthValue of truthValues) {
    const matchIndex = testValuesCopy.findIndex((testValue) =>
      fuzzyMatchValues(
        truthValue,
        testValue,
        nestedArrayOrderMatters,
        allowedNumberDifference
      )
    );

    if (matchIndex === -1) {
      // No matching value found
      return false;
    } else {
      // Remove the matched value to prevent duplicate matching
      testValuesCopy.splice(matchIndex, 1);
    }
  }

  // All values matched
  return true;
}

/**
  Fuzzy comparison function for values.
 */
function fuzzyMatchValues(
  truthVal: unknown,
  testVal: unknown,
  nestedArrayOrderMatters?: boolean,
  allowedNumberDifference = 0.01
): boolean {
  // Fuzzy conditions:
  // - If values are numbers, allow a small difference
  if (typeof truthVal === "number" && typeof testVal === "number") {
    const difference = Math.abs(truthVal - testVal);
    if (difference > allowedNumberDifference) return false;
  }
  // If values are arrays, recursively call fuzzyMatchArrays
  else if (Array.isArray(truthVal) && Array.isArray(testVal)) {
    if (
      fuzzyMatchArrays(
        truthVal as Array<Record<string, unknown>>,
        testVal as Array<Record<string, unknown>>,
        nestedArrayOrderMatters,
        allowedNumberDifference
      ) === false
    )
      return false;
  }
  // Handle null values explicitly
  else if (truthVal === null) {
    if (testVal !== null) return false;
  }
  // Nested objects
  else if (typeof truthVal === "object" && typeof testVal === "object") {
    if (
      fuzzyMatchObjects(
        truthVal as Record<string, unknown>,
        testVal as Record<string, unknown>,
        nestedArrayOrderMatters,
        allowedNumberDifference
      ) === false
    )
      return false;
  } else {
    // For other types, use strict equality
    if (truthVal !== testVal) return false;
  }
  return true;
}
