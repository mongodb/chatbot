/**
  Default list of mutative MongoDB methods.
 */
export const JS_MUTATIVE_METHODS = [
  // Document insertion methods
  "insertOne",
  "insertMany",
  "insert",
  // Document update methods
  "updateOne",
  "updateMany",
  "update",
  "replaceOne",
  "findOneAndUpdate",
  "findOneAndReplace",
  "findAndModify",
  "save",
  "upsert",
  // Document deletion methods
  "deleteOne",
  "deleteMany",
  "remove",
  "findOneAndDelete",
  "findOneAndRemove",
  // Collection methods that modify data
  "drop",
  "createIndex",
  "createIndexes",
  "dropIndex",
  "dropIndexes",
  // Database methods that modify data
  "dropDatabase",
  "renameCollection",
  // Bulk operations
  "bulkWrite",
];

/**
 Checks if the given methods are mutative.
 */
export function isNonMutativeOperation(
  methods: string[] | undefined,
  mutativeMethods: string[] = JS_MUTATIVE_METHODS
): boolean {
  // If methods is undefined or empty, consider it safe
  if (!methods || methods.length === 0) {
    return true;
  }

  // Check if any of the methods are in the mutative list
  return !methods.some((method) => mutativeMethods.includes(method));
}
