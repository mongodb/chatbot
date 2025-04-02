import {
  isNonMutativeOperation,
  JS_MUTATIVE_METHODS,
} from "./isNonMutativeOperation";

describe("isNonMutativeOperation", () => {
  // Test case for undefined methods
  test("should return true for undefined methods", () => {
    expect(isNonMutativeOperation(undefined)).toBe(true);
  });

  // Test case for empty methods array
  test("should return true for empty methods array", () => {
    expect(isNonMutativeOperation([])).toBe(true);
  });

  // Test case for non-mutative methods
  test("should return true for non-mutative methods", () => {
    const nonMutativeMethods = [
      "find",
      "findOne",
      "aggregate",
      "count",
      "distinct",
    ];
    expect(isNonMutativeOperation(nonMutativeMethods)).toBe(true);
  });

  // Test case for mutative methods
  test("should return false when methods contain mutative operations", () => {
    const mutativeMethods = ["find", "insertOne", "aggregate"];
    expect(isNonMutativeOperation(mutativeMethods)).toBe(false);
  });

  // Test case for multiple mutative methods
  test("should return false when methods contain multiple mutative operations", () => {
    const multipleMutativeMethods = ["insertOne", "updateOne", "deleteOne"];
    expect(isNonMutativeOperation(multipleMutativeMethods)).toBe(false);
  });

  // Test case for custom mutative methods list
  test("should use custom mutative methods list when provided", () => {
    const methods = ["find", "customMutativeMethod", "aggregate"];
    const customMutativeMethods = ["customMutativeMethod"];
    expect(isNonMutativeOperation(methods, customMutativeMethods)).toBe(false);
  });

  // Test case for case-sensitive method names
  test("should be case-sensitive when checking method names", () => {
    const methods = ["insertone", "INSERTONE", "InsertOne"];
    expect(isNonMutativeOperation(methods)).toBe(true); // These don't match "insertOne" exactly
  });

  // Test case for all default mutative methods
  test("should identify all default mutative methods", () => {
    // Test each method individually
    JS_MUTATIVE_METHODS.forEach((method) => {
      expect(isNonMutativeOperation([method])).toBe(false);
    });
  });
});
