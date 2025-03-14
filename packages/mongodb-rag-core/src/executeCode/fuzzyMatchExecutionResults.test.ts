import { fuzzyMatchExecutionResults } from "./fuzzyMatchExecutionResults";

describe("fuzzyMatchExecutionResults()", () => {
  test("should return true for identical arrays with identical objects in the same order", () => {
    const mongoDbOutput = [
      { id: 1, name: "Alice", score: 95.0 },
      { id: 2, name: "Bob", score: 85.5 },
      { id: 3, name: "Charlie", score: 78.2 },
    ];

    const expected = [
      { id: 1, name: "Alice", score: 95.0 },
      { id: 2, name: "Bob", score: 85.5 },
      { id: 3, name: "Charlie", score: 78.2 },
    ];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
    });

    expect(result).toBe(true);
  });

  test("should return true for identical arrays with identical objects in different order when orderMatters is false", () => {
    const mongoDbOutput = [
      { id: 3, name: "Charlie", score: 78.2 },
      { id: 1, name: "Alice", score: 95.0 },
      { id: 2, name: "Bob", score: 85.5 },
    ];

    const expected = [
      { id: 1, name: "Alice", score: 95.0 },
      { id: 2, name: "Bob", score: 85.5 },
      { id: 3, name: "Charlie", score: 78.2 },
    ];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: false,
    });

    expect(result).toBe(true);
  });

  test("should return false for arrays with different lengths", () => {
    const mongoDbOutput = [{ id: 1, name: "Alice", score: 95.0 }];

    const expected = [
      { id: 1, name: "Alice", score: 95.0 },
      { id: 2, name: "Bob", score: 85.5 },
    ];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
    });

    expect(result).toBe(false);
  });

  test("should return true when numbers differ within allowed tolerance", () => {
    const mongoDbOutput = [{ id: 1, value: 100.005 }];

    const expected = [{ id: 1, value: 100.0 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
      allowedNumberDifference: 0.1,
    });

    expect(result).toBe(true);
  });

  test("should return false when numbers differ beyond allowed tolerance", () => {
    const mongoDbOutput = [{ id: 1, value: 101.1 }];

    const expected = [{ id: 1, value: 100.0 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
      allowedNumberDifference: 1,
    });

    expect(result).toBe(false);
  });

  test("should return false when strings differ in case or whitespace", () => {
    const mongoDbOutput = [{ id: 1, name: " Alice " }];

    const expected = [{ id: 1, name: "alice" }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
    });

    expect(result).toBe(false);
  });

  test("should return false when strings differ significantly", () => {
    const mongoDbOutput = [{ id: 1, name: "Bob" }];

    const expected = [{ id: 1, name: "Alice" }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
    });

    expect(result).toBe(false);
  });

  test("should return true when objects have extra keys", () => {
    const mongoDbOutput = [{ id: 1, name: "Alice", age: 30 }];

    const expected = [{ id: 1, name: "Alice" }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
    });

    expect(result).toBe(true);
  });
  test("should return true when objects have extra keys - 2", () => {
    const mongoDbOutput = [
      {
        _id: "66867fa4a4ef8f1ce22fb1ad",
        Name: "Adjuntas",
        Asian: 0,
        Black: 3.1,
        White: 93.1,
        City_ID: 1,
        Hispanic: 99.6,
        County_ID: 1,
        Amerindian: 0.3,
        Multiracial: 3.4,
      },
      {
        _id: "66867fa4a4ef8f1ce22fb1ae",
        Name: "Aguada",
        Asian: 0.1,
        Black: 5.3,
        White: 86.6,
        City_ID: 2,
        Hispanic: 99.4,
        County_ID: 1,
        Amerindian: 0.3,
        Multiracial: 7.7,
      },
    ];

    const expected = [{ Name: "Adjuntas" }, { Name: "Aguada" }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: false,
    });

    expect(result).toBe(true);
  });

  test("should return true for nested arrays and objects that match", () => {
    const mongoDbOutput = [
      {
        id: 1,
        details: {
          hobbies: ["Reading", "Swimming"],
          scores: [95.0, 85.5],
        },
      },
    ];

    const expected = [
      {
        id: 1,
        details: {
          hobbies: ["Swimming", "Reading"],
          scores: [95.0, 85.5],
        },
      },
    ];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: false,
    });

    expect(result).toBe(true);
  });

  test("should return false for nested arrays and objects that do not match", () => {
    const mongoDbOutput = [
      {
        id: 1,
        details: {
          hobbies: ["Reading", "Swimming"],
          scores: [95.0, 85.5],
        },
      },
    ];

    const expected = [
      {
        id: 1,
        details: {
          hobbies: ["Reading", "Cycling"],
          scores: [95.0, 85.5],
        },
      },
    ];

    const result = fuzzyMatchExecutionResults({ mongoDbOutput, expected });

    expect(result).toBe(false);
  });

  test("should return true when comparing null values", () => {
    const mongoDbOutput = [{ id: 1, name: null }];

    const expected = [{ id: 1, name: null }];

    const result = fuzzyMatchExecutionResults({ mongoDbOutput, expected });

    expect(result).toBe(true);
  });

  test("should return false when one value is null and the other is not", () => {
    const mongoDbOutput = [{ id: 1, name: null }];

    const expected = [{ id: 1, name: "Alice" }];

    const result = fuzzyMatchExecutionResults({ mongoDbOutput, expected });

    expect(result).toBe(false);
  });

  test("should handle empty arrays", () => {
    const mongoDbOutput: unknown[] = [];
    const expected: unknown[] = [];

    const result = fuzzyMatchExecutionResults({ mongoDbOutput, expected });
    const resultOrdered = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      orderMatters: true,
    });

    expect(result).toBe(true);
    expect(resultOrdered).toBe(true);
  });

  test("should handle arrays with different types of elements", () => {
    const mongoDbOutput = [
      { id: 1, value: "100" },
      { id: 2, value: 200 },
      { id: 3, value: null },
    ];

    const expected = [
      { id: 1, value: 100 },
      { id: 2, value: 200 },
      { id: 3, value: null },
    ];

    const result = fuzzyMatchExecutionResults({ mongoDbOutput, expected });

    expect(result).toBe(false);
  });

  test("should return false when arrays have different elements", () => {
    const mongoDbOutput = [
      { id: 1, name: "Alice" },
      { id: 2, name: "Bob" },
    ];

    const expected = [
      { id: 1, name: "Alice" },
      { id: 3, name: "Charlie" },
    ];

    const result = fuzzyMatchExecutionResults({ mongoDbOutput, expected });

    expect(result).toBe(false);
  });
});

describe("fuzzyMatch() with Aggregations", () => {
  test("should return true for exact matching aggregation with a single document", () => {
    const mongoDbOutput = [{ count: 10 }];
    const expected = [{ count: 10 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(true);
  });
  test("should return true for fuzzy match aggregation with multiple documents", () => {
    const mongoDbOutput = [{ count: 1 }, { count: 2 }];

    const expected = [{ OTHER: 1 }, { OTHER: 2 }];

    expect(
      fuzzyMatchExecutionResults({
        mongoDbOutput,
        expected,
        isAggregation: true,
      })
    ).toBe(true);
  });

  test("should return true when scalar aggregation result matches with allowed tolerance", () => {
    const allowedNumberDifference = 0.05;

    const mongoDbOutput = { count: 10 + allowedNumberDifference / 2 };
    const expected = [{ count: 10 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
      allowedNumberDifference,
    });

    expect(result).toBe(true);
  });

  test("should return false when scalar aggregation result exceeds allowed tolerance", () => {
    const allowedNumberDifference = 0.05;
    const mongoDbOutput = { count: 11 + allowedNumberDifference * 2 };
    const expected = [{ count: 10 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
      allowedNumberDifference,
    });

    expect(result).toBe(false);
  });

  test("should return true when aggregation result is a scalar and matches", () => {
    const mongoDbOutput = 100;
    const expected = [{ "count(*)": 100 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(true);
  });
  test("should return false when aggregation result is a scalar and does not match", () => {
    const mongoDbOutput = 50;
    const expected = [{ "count(*)": 100 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(false);
  });

  test("should return true when aggregation output has extra keys", () => {
    const mongoDbOutput = [{ count: 10, extra: "ignore" }];
    const expected = [{ count: 10 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(true);
  });

  test("should return true when aggregation output has mismatched keys", () => {
    const mongoDbOutput = [{ total: 10 }];
    const expected = [{ count: 10 }];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(true);
  });

  test("should handle nested objects in aggregation results", () => {
    const mongoDbOutput = [
      {
        total: {
          amount: 100,
          items: 5,
        },
      },
    ];

    const expected = [
      {
        total: {
          amount: 100,
          items: 5,
        },
      },
    ];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(true);
  });

  test("should return false when nested objects in aggregation results differ", () => {
    const mongoDbOutput = [
      {
        total: {
          amount: 100,
          items: 5,
        },
      },
    ];

    const expected = [
      {
        total: {
          amount: 100,
          items: 6, // Different value here
        },
      },
    ];

    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
    });

    expect(result).toBe(false);
  });
  test("should return true when mixed types in aggregation results match", () => {
    const expected = [
      { Name: "Ray Ferris", "COUNT(*)": 1 },
      { Name: "Jackie Waring", "COUNT(*)": 2 },
    ];
    const mongoDbOutput = [
      {
        _id: "6684f86294b83277ad66390b",
        Name: "Jackie Waring",
        eventCount: 2,
      },
      {
        _id: "6684f86294b83277ad66390d",
        Name: "Ray Ferris",
        eventCount: 1,
      },
    ];
    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
      orderMatters: false,
    });

    expect(result).toBe(true);
  });
  test("should return true when mixed types in aggregation results match - 2 ", () => {
    const expected = [
      { "count(*)": 4, Sex: "M" },
      { "count(*)": 3, Sex: "F" },
    ];
    const mongoDbOutput = [
      {
        _id: "F",
        count: 3,
      },
      {
        _id: "M",
        count: 4,
      },
    ];
    const result = fuzzyMatchExecutionResults({
      mongoDbOutput,
      expected,
      isAggregation: true,
      orderMatters: false,
    });

    expect(result).toBe(true);
  });
});
