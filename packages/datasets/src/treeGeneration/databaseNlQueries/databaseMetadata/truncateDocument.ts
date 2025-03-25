import { Document, ObjectId } from "mongodb-rag-core/mongodb";

export interface TruncationOptions {
  maxStringLength?: number;
  maxArrayLength?: number;
  maxObjectDepth?: number;
  maxObjectKeys?: number;
}

export const defaultTruncationOptions: TruncationOptions = {
  /**
    Max length of a string property value.
   */
  maxStringLength: 100,
  /**
    Includes the half at the beginning and half at the end, removing middle elements.
   */
  maxArrayLength: 6,
  /**
    Maximum depth of nested objects. 
   */
  maxObjectDepth: 5,
  maxObjectKeys: 25,
};

function truncateValue(
  value: any,
  options: TruncationOptions = defaultTruncationOptions,
  currentDepth = 0
): any {
  if (value === null || value === undefined) {
    return value;
  }

  // Handle dates
  if (value instanceof Date) {
    return value;
  }
  if (value instanceof ObjectId) {
    return { $oid: value.toHexString() };
  }

  // Handle strings
  if (typeof value === "string" && options.maxStringLength) {
    return value.length > options.maxStringLength
      ? `${value.slice(0, options.maxStringLength)}...`
      : value;
  }

  // Handle arrays
  if (Array.isArray(value) && options.maxArrayLength) {
    if (value.length <= options.maxArrayLength) {
      // If array is already shorter than max length, just process each item
      return value.map((item) =>
        truncateValue(item, options, currentDepth + 1)
      );
    } else {
      // Calculate how many items to show at the beginning and end
      const halfLength = Math.floor(options.maxArrayLength / 2);
      const firstHalfLength =
        options.maxArrayLength % 2 === 0 ? halfLength : halfLength + 1;

      // Get first half of elements
      const firstHalf = value
        .slice(0, firstHalfLength)
        .map((item) => truncateValue(item, options, currentDepth + 1));

      // Get second half of elements
      const secondHalf = value
        .slice(value.length - halfLength)
        .map((item) => truncateValue(item, options, currentDepth + 1));

      // Add a message in the middle indicating how many items were skipped
      const skippedCount = value.length - firstHalfLength - halfLength;

      return [
        ...firstHalf,
        `...${skippedCount} items omitted...`,
        ...secondHalf,
      ];
    }
  }

  // Handle objects
  if (typeof value === "object") {
    // Stop at max depth
    if (currentDepth >= (options.maxObjectDepth ?? Infinity)) {
      return "[Object]";
    }

    const entries = Object.entries(value);
    const maxKeys = options.maxObjectKeys ?? Infinity;

    // Only truncate if we have more keys than the limit
    const keysToInclude = entries.length > maxKeys ? maxKeys : entries.length;

    // Truncate number of keys if needed
    const truncatedEntries = entries
      .slice(0, keysToInclude)
      .map(([key, val]) => [
        key,
        truncateValue(val, options, currentDepth + 1),
      ]);

    const result = Object.fromEntries(truncatedEntries);
    if (entries.length > maxKeys) {
      result["..."] = `${entries.length - maxKeys} more keys`;
    }
    return result;
  }

  // Return primitives as is
  return value;
}

/**
  Truncate long values in the MongoDB outputs so that it fits within the context of the LLM.
  @param input The MongoDB output to truncate
  @param options Configuration for how to truncate different types of values
  @returns A new document with truncated values
 */
export function truncateDbOperationOutputForLlm<
  T extends Document | Document[] | null
>(input: T, options: TruncationOptions = defaultTruncationOptions) {
  return truncateValue(input, options) as T;
}
