import { DatabaseExecutionResult } from "./DatabaseExecutionResult";

export const REASONS = {
  NULL: "Result is null",
  ZERO: "Result is 0",
  EMPTY_ARRAY: "Result is empty array",
  EMPTY_OBJECT: "Result is empty object",
  ARRAY_OF_NULL_OR_EMPTY: "Array contains null or empty string values",
  MIXED_ARRAY_NULL_OR_EMPTY: "Mixed array contains null or empty string values",
  REASONABLE: "Result is reasonable",
} as const;

/**
  Checks if the result is non-empty. A 'non-empty' result is one that does not meet the following criteria:
  - null
  - 0
  - empty array
  - empty object
 */
export function isNonEmptyResult(
  result: DatabaseExecutionResult["result"]
): IsReasonableResultReturnValue {
  const emptyOutput = {
    success: false,
  };
  const noOutput = result === null;
  if (noOutput) {
    return { ...emptyOutput, reason: REASONS.NULL };
  }
  const zeroOutput = result === 0;
  if (zeroOutput) {
    return { ...emptyOutput, reason: REASONS.ZERO };
  }

  const isArray = Array.isArray(result);
  const isEmptyArray = isArray && result.length === 0;
  if (isEmptyArray) {
    return { ...emptyOutput, reason: REASONS.EMPTY_ARRAY };
  }

  const isEmptyObject =
    typeof result === "object" && Object.keys(result).length === 0;
  if (isEmptyObject) {
    return { ...emptyOutput, reason: REASONS.EMPTY_OBJECT };
  }

  return {
    success: true,
    reason: REASONS.REASONABLE,
  };
}

export interface IsReasonableResultReturnValue {
  success: boolean;
  reason?: string;
}
/**
 Checks if the result is reasonable. A 'reasonable' result is one that does not meet the following criteria:
 - null
 - 0
 - empty array
 - empty object
 - in array of objects, the objects do not contain `null` or `''`
 - in array of scalars, values do not contain `null` or `''`
 - in mixed array of objects and scalars, the objects do not contain `null` or `''` and the scalars do not contain `null` or `''`
 */
export function isReasonableResult(
  result: DatabaseExecutionResult["result"]
): IsReasonableResultReturnValue {
  const nonEmptyResult = isNonEmptyResult(result);
  if (!nonEmptyResult.success) {
    return nonEmptyResult;
  }

  // Default to not reasonable output
  const reasonableOutput = {
    success: false,
  };

  const isArray = Array.isArray(result);
  // Check if array of objects contains null or empty string values
  if (
    isArray &&
    result.length > 0 &&
    result.every((r) => typeof r === "object" && r !== null)
  ) {
    for (const item of result) {
      if (!item || typeof item !== "object") continue;

      const hasNullOrEmptyValues = Object.values(item).some(
        (value) => value === null || value === ""
      );

      if (hasNullOrEmptyValues) {
        return {
          ...reasonableOutput,
          reason: REASONS.ARRAY_OF_NULL_OR_EMPTY,
        };
      }
    }
  }

  // Check if array of scalars contains null or empty string values
  if (
    isArray &&
    result.length > 0 &&
    result.every((r) => typeof r !== "object" || r === null)
  ) {
    const hasNullOrEmptyValues = result.some(
      (value) => value === null || value === ""
    );

    if (hasNullOrEmptyValues) {
      return {
        ...reasonableOutput,
        reason: "Array contains null or empty string values",
      };
    }
  }

  // Check if mixed array of objects and scalars contains null or empty string values
  if (
    isArray &&
    result.length > 0 &&
    !result.every((r) => typeof r === "object" && r !== null) &&
    !result.every((r) => typeof r !== "object" || r === null)
  ) {
    // Check objects in the mixed array
    const objectItems = result.filter(
      (item): item is object => typeof item === "object" && item !== null
    );

    for (const item of objectItems) {
      const hasNullOrEmptyValues = Object.values(item).some(
        (value) => value === null || value === ""
      );

      if (hasNullOrEmptyValues) {
        return {
          ...reasonableOutput,
          reason: REASONS.MIXED_ARRAY_NULL_OR_EMPTY,
        };
      }
    }

    // Check scalar values in the mixed array
    const scalarItems = result.filter(
      (item) => item === null || typeof item !== "object"
    );

    const hasNullOrEmptyScalars = scalarItems.some(
      (value) => value === null || value === ""
    );

    if (hasNullOrEmptyScalars) {
      return {
        ...reasonableOutput,
        reason: REASONS.MIXED_ARRAY_NULL_OR_EMPTY,
      };
    }
  }

  // For successful cases, match the expected format in tests
  return {
    success: true,
    reason: REASONS.REASONABLE,
  };
}
