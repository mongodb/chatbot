import {
  isReasonableResult,
  isNonEmptyResult,
  REASONS,
} from "./isReasonableResult";

describe("isNonEmptyResult", () => {
  it("should return `false` for null output", async () => {
    const output = null;

    const result = isNonEmptyResult(output);

    expect(result).toEqual({
      success: false,
      reason: REASONS.NULL,
    });
  });

  it("should return `false` for 0 output", async () => {
    const output = 0;

    const result = isNonEmptyResult(output);

    expect(result).toEqual({
      success: false,
      reason: REASONS.ZERO,
    });
  });

  it("should return `false` for empty array output", async () => {
    const output: unknown[] = [];

    const result = isNonEmptyResult(output);

    expect(result).toEqual({
      success: false,
      reason: REASONS.EMPTY_ARRAY,
    });
  });

  it("should return `false` for empty object output", async () => {
    const output = {};

    const result = isNonEmptyResult(output);

    expect(result).toEqual({
      success: false,
      reason: REASONS.EMPTY_OBJECT,
    });
  });

  it("should return `true` for non-empty values", async () => {
    const validValues = [{ name: "John" }, [1, 2, 3], 42];

    for (const output of validValues) {
      const result = isNonEmptyResult(output);
      expect(result).toEqual({
        success: true,
        reason: REASONS.REASONABLE,
      });
    }
  });
});

describe("isReasonableResult", () => {
  describe("Array of objects", () => {
    it("should return `false` when array contains objects with null values", async () => {
      const output = [
        { name: "John", age: null },
        { name: "Jane", age: 30 },
      ];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.ARRAY_OF_NULL_OR_EMPTY,
      });
    });

    it("should return `false` when array contains objects with empty string values", async () => {
      const output = [
        { name: "John", email: "" },
        { name: "Jane", email: "jane@example.com" },
      ];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.ARRAY_OF_NULL_OR_EMPTY,
      });
    });

    it("should return `true` when array contains objects with valid values", async () => {
      const output = [
        { name: "John", age: 25 },
        { name: "Jane", age: 30 },
      ];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: true,
        reason: REASONS.REASONABLE,
      });
    });
  });

  describe("Array of scalars", () => {
    it("should return `false` when array contains null values", async () => {
      const output = ["John", null, "Jane"];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.ARRAY_OF_NULL_OR_EMPTY,
      });
    });

    it("should return `false` when array contains empty string values", async () => {
      const output = ["John", "", "Jane"];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.ARRAY_OF_NULL_OR_EMPTY,
      });
    });

    it("should return `true` when array contains valid scalar values", async () => {
      const output = ["John", "Jane", "Doe"];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: true,
        reason: REASONS.REASONABLE,
      });
    });
  });

  describe("Mixed array of objects and scalars", () => {
    it("should return `false` when mixed array contains objects with null values", async () => {
      const output = ["John", { name: "Jane", age: null }, 42];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.MIXED_ARRAY_NULL_OR_EMPTY,
      });
    });

    it("should return `false` when mixed array contains objects with empty string values", async () => {
      const output = ["John", { name: "Jane", email: "" }, 42];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.MIXED_ARRAY_NULL_OR_EMPTY,
      });
    });

    it("should return `false` when mixed array contains null scalar values", async () => {
      const output = [null, { name: "Jane", age: 30 }, 42];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.MIXED_ARRAY_NULL_OR_EMPTY,
      });
    });

    it("should return `false` when mixed array contains empty string scalar values", async () => {
      const output = ["", { name: "Jane", age: 30 }, 42];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: false,
        reason: REASONS.MIXED_ARRAY_NULL_OR_EMPTY,
      });
    });

    it("should return `true` when mixed array contains valid values", async () => {
      const output = ["John", { name: "Jane", age: 30 }, 42];

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: true,
        reason: REASONS.REASONABLE,
      });
    });
  });

  describe("Basic emptiness checks", () => {
    it("should delegate to isNonEmptyResult for null values", async () => {
      const output = null;
      const nonEmptyResult = isNonEmptyResult(output);
      const reasonableResult = isReasonableResult(output);
      expect(reasonableResult).toEqual(nonEmptyResult);
    });

    it("should delegate to isNonEmptyResult for empty arrays", async () => {
      const output: unknown[] = [];
      const nonEmptyResult = isNonEmptyResult(output);
      const reasonableResult = isReasonableResult(output);
      expect(reasonableResult).toEqual(nonEmptyResult);
    });

    it("should delegate to isNonEmptyResult for empty objects", async () => {
      const output = {};
      const nonEmptyResult = isNonEmptyResult(output);
      const reasonableResult = isReasonableResult(output);
      expect(reasonableResult).toEqual(nonEmptyResult);
    });
  });

  describe("Single values", () => {
    it("should return `true` for a single valid object", async () => {
      const output = { name: "John", age: 30 };

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: true,
        reason: REASONS.REASONABLE,
      });
    });

    it("should return `true` for a single valid scalar", async () => {
      const output = 42;

      const isReasonable = isReasonableResult(output);

      expect(isReasonable).toEqual({
        success: true,
        reason: REASONS.REASONABLE,
      });
    });
  });
});
