// Common MongoDB Node.js methods
export const commonMongoDbNodeJsMethods = new Set([
  "find",
  "findOne",
  "insertOne",
  "insertMany",
  "updateOne",
  "updateMany",
  "deleteOne",
  "deleteMany",
  "aggregate",
  "count",
  "countDocuments",
  "distinct",
  "watch",
  "bulkWrite",
  "replaceOne",
  "findOneAndUpdate",
  "findOneAndReplace",
  "findOneAndDelete",
  "createIndex",
  "createIndexes",
  "dropIndex",
  "dropIndexes",
  "listIndexes",
  "indexExists",
  "indexInformation",
  "stats",
  "estimatedDocumentCount",
  "mapReduce",
  "group",
  "rename",
  "drop",
  "options",
  "isCapped",
  "createCollection",
  "listCollections",
  "indexExists",
  "indexes",
  // Cursor methods often used in chaining
  "sort",
  "limit",
  "skip",
  "project",
  "projection",
  "toArray",
  "next",
  "hasNext",
  "forEach",
  "explain",
  "hint",
  "collation",
  "batchSize",
  "maxTimeMS",
]);

/**
  Extracts MongoDB method calls from code.

 */
export function extractMongoDbMethods(
  code: string,
  methods: Set<string> = commonMongoDbNodeJsMethods
): string[] {
  // Regular expression to match method calls on MongoDB collections
  // This pattern looks for method calls in the format collection.method() or chain.method()
  // We need to capture both direct collection methods and chained methods
  const methodRegex = /\.(\w+)\s*\(/g;

  // Extract all method matches
  const matches = Array.from(code.matchAll(methodRegex));

  // Filter to only include known MongoDB methods and remove duplicates
  const methodsFound = matches
    .map((match) => match[1]) // Extract the method name from the regex match
    .filter((method) => methods.has(method));

  // Remove duplicates by converting to Set and back to Array
  return [...new Set(methodsFound)];
}

/**
  Extracts MongoDB query operators from code.
 */
export function extractMongoDbQueryOperators(code: string): string[] {
  // Regular expression to match MongoDB query operators
  // This pattern looks for operators in the format $operatorName in various contexts
  // 1. As an object key: { $match: {...} }
  const operatorAsKeyRegex = /[{,]\s*["']?(\$[a-zA-Z0-9]+)["']?\s*:/g;

  // Extract the operator names from the matches and remove duplicates
  const operatorsFound = Array.from(
    new Set(
      Array.from(code.matchAll(operatorAsKeyRegex)).map((match) => match[1])
    )
  );

  return operatorsFound;
}
