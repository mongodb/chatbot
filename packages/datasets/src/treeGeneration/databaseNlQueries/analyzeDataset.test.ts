import {
  countUsage,
  calculatePercentages,
  checkOperatorFrequency,
  countAndLogUsage,
  countStringProperty,
} from "./analyzeDataset";
import { DatabaseNlQueryDatasetEntry } from "./DatabaseNlQueryDatasetEntry";
import { Frequency } from "./queryOperators";

// Mock console methods to test logging
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;

beforeEach(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.warn = originalConsoleWarn;
});

const sampleEntry = {
  complexity: "simple",
  result: null,
  executionTimeMs: 100,
  databaseName: "foo",
  dbQuery: "db.foo.find({})",
  generationUuid: "bar",
  queryOperators: ["$eq"],
  methods: ["find"],
  language: "js",
  nlQuery: "what is foo?",
};

describe("countUsage", () => {
  test("should count methods usage", () => {
    const entries: DatabaseNlQueryDatasetEntry[] = [
      { ...sampleEntry, methods: ["find", "aggregate"] },
      { ...sampleEntry, methods: ["find"] },
      { ...sampleEntry, methods: ["aggregate", "count"] },
    ];

    const result = countUsage(entries, "methods");

    expect(result).toEqual({
      find: 2,
      aggregate: 2,
      count: 1,
    });
  });

  test("should count queryOperators usage", () => {
    const entries: DatabaseNlQueryDatasetEntry[] = [
      { ...sampleEntry, queryOperators: ["$eq", "$and"] },
      { ...sampleEntry, queryOperators: ["$eq"] },
      { ...sampleEntry, queryOperators: ["$and", "$or"] },
    ];

    const result = countUsage(entries, "queryOperators");

    expect(result).toEqual({
      $eq: 2,
      $and: 2,
      $or: 1,
    });
  });

  test("should handle undefined properties", () => {
    const entries: DatabaseNlQueryDatasetEntry[] = [
      { ...sampleEntry, methods: undefined },
      { ...sampleEntry, methods: [] },
      { ...sampleEntry, methods: undefined },
    ];

    const result = countUsage(entries, "methods");

    expect(result).toEqual({});
  });
});

describe("countStringProperty", () => {
  test("should count occurrences of a string property", () => {
    const entries = [
      { databaseName: "sample_mflix", id: 1 },
      { databaseName: "sample_mflix", id: 2 },
      { databaseName: "sample_airbnb", id: 3 },
      { databaseName: "sample_restaurants", id: 4 },
    ];

    const result = countStringProperty(entries, "databaseName");

    expect(result).toEqual({
      sample_mflix: 2,
      sample_airbnb: 1,
      sample_restaurants: 1,
    });
  });

  test("should handle empty entries array", () => {
    const entries: Array<{ databaseName: string }> = [];

    const result = countStringProperty(entries, "databaseName");

    expect(result).toEqual({});
  });

  test("should handle undefined or empty values", () => {
    const entries = [
      { databaseName: "sample_mflix" },
      { databaseName: "" },
      { databaseName: undefined as unknown as string },
    ];

    const result = countStringProperty(entries, "databaseName");

    expect(result).toEqual({
      sample_mflix: 1,
      "": 2, // Both empty string and undefined are counted as empty string
    });
  });
});

describe("calculatePercentages", () => {
  test("should calculate percentages correctly", () => {
    const counts = {
      find: 20,
      aggregate: 10,
      count: 10,
    };

    const result = calculatePercentages(counts, 40);

    expect(result).toEqual({
      find: 0.5,
      aggregate: 0.25,
      count: 0.25,
    });
  });

  test("should handle empty counts", () => {
    const result = calculatePercentages({}, 100);

    expect(result).toEqual({});
  });

  test("should handle zero total queries", () => {
    const counts = {
      find: 10,
      aggregate: 5,
    };

    const result = calculatePercentages(counts, 0);

    // When totalQueries is 0, percentages should be Infinity
    expect(result.find).toBe(Infinity);
    expect(result.aggregate).toBe(Infinity);
  });
});

describe("checkOperatorFrequency", () => {
  test("should identify undefined operators", () => {
    const operatorPercentages = {
      $unknownOp: 5,
    };

    const res = checkOperatorFrequency(operatorPercentages);

    expect(res).toEqual({
      $unknownOp: {
        actual: 5,
        min: null,
        max: null,
        label: "not_specified",
      },
    });
  });

  test("should identify operators below minimum representation", () => {
    // Create a test case where an operator is below its minimum representation
    const operatorPercentages = {
      $eq: 0.1, // This is below the minimum for most_common (0.2)
    };

    const res = checkOperatorFrequency(operatorPercentages);
    // Check the result
    expect(res).toEqual({
      $eq: {
        actual: 0.1,
        min: 0.2,
        max: expect.any(Number),
        label: "below_minimum",
      },
    });
  });
  test("should identify operators that exceed maximum representation", () => {
    // Create a test case where an operator exceeds its maximum representation
    // For this test, we'll create mock operators and representation data
    const mockOperators: Record<string, Frequency> = {
      $test: "most_common",
    };

    const mockRepresentation: Record<Frequency, [number, number]> = {
      most_common: [0.2, 0.5], // min: 0.2, max: 0.5
      common: [0.01, 0.3],
      uncommon: [0.0001, 0.05],
      not_defined: [0, 1],
    };

    const operatorPercentages = {
      $test: 0.8, // This exceeds the maximum of 0.5
    };

    const res = checkOperatorFrequency(
      operatorPercentages,
      mockOperators,
      mockRepresentation
    );

    expect(res).toEqual({
      $test: {
        actual: 0.8,
        min: 0.2,
        max: 0.5,
        label: "above_maximum",
      },
    });
  });
  test("should identify missing operators", () => {
    const operatorPercentages = {
      // Empty object to test missing operators
    };

    const res = checkOperatorFrequency(operatorPercentages);

    expect(res).toEqual({});
  });
  test("should identify operators within bounds", () => {
    // Create a test case with an operator that is within bounds
    const mockOperators: Record<string, Frequency> = {
      $test: "most_common",
    };

    const mockRepresentation: Record<Frequency, [number, number]> = {
      most_common: [0.2, 0.5], // min: 0.2, max: 0.5
      common: [0.01, 0.3],
      uncommon: [0.0001, 0.05],
      not_defined: [0, 1],
    };

    const operatorPercentages = {
      $test: 0.3, // This is within bounds (0.2 - 0.5)
    };

    const res = checkOperatorFrequency(
      operatorPercentages,
      mockOperators,
      mockRepresentation
    );

    expect(res).toEqual({
      $test: {
        actual: 0.3,
        min: 0.2,
        max: 0.5,
        label: "within_bounds",
      },
    });
  });
});

describe("countAndLogUsage", () => {
  test("should call all the necessary functions and log results", () => {
    const entries: DatabaseNlQueryDatasetEntry[] = [
      { ...sampleEntry, methods: ["find"], queryOperators: ["$eq", "$and"] },
      { ...sampleEntry, methods: ["aggregate"], queryOperators: ["$group"] },
    ];

    countAndLogUsage(entries);

    // Verify that console.log was called with the expected arguments
    // Check for total entries count
    expect(console.log).toHaveBeenCalledWith(
      "Total number of entries in dataset:",
      2
    );

    // Check for database name counts
    expect(console.log).toHaveBeenCalledWith(
      "DB entry count:",
      expect.objectContaining({
        foo: 2,
      })
    );

    // Check for method counts
    expect(console.log).toHaveBeenCalledWith(
      "Method counts:",
      expect.objectContaining({
        find: 1,
        aggregate: 1,
      })
    );

    // Check for operator counts
    expect(console.log).toHaveBeenCalledWith(
      "Query operator counts:",
      expect.objectContaining({
        $eq: 1,
        $and: 1,
        $group: 1,
      })
    );
  });
});
