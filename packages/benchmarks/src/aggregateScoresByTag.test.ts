import { EvalCase } from "mongodb-rag-core/braintrust";
import {
  aggregateScoresByTag,
  calculateStats,
  convertTagStatsToFlatObject,
} from "./aggregateScoresByTag";

describe("calculateStats", () => {
  test("calculates correct statistics for an array of numbers", () => {
    const values = [1, 2, 3, 4, 5];
    const stats = calculateStats(values);

    expect(stats.mean).toBe(3);
    expect(stats.median).toBe(3);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(5);
    expect(stats.count).toBe(values.length);
  });

  test("calculates correct median for even number of elements", () => {
    const values = [1, 2, 3, 4];
    const stats = calculateStats(values);

    expect(stats.median).toBe(2.5); // (2 + 3) / 2
  });

  test("calculates correct mode", () => {
    const values = [1, 2, 2, 3, 4];
    const stats = calculateStats(values);

    expect(stats.mode).toBe(2);
  });

  test("returns null for mode when all values have same frequency", () => {
    const values = [1, 2, 3, 4];
    const stats = calculateStats(values);

    expect(stats.mode).toBeNull();
  });

  test("throws error for empty array", () => {
    expect(() => calculateStats([])).toThrow(
      "Cannot calculate statistics for an empty array"
    );
  });
});

describe("convertTagStatsToFlatObject", () => {
  test("converts tagStats Map to a flat object with formatted headers", () => {
    // Create a mock tagStats Map
    const tagStats = new Map();

    // Add stats for mongodb tag
    tagStats.set("mongodb", {
      accuracy: {
        mean: 0.9,
        median: 0.9,
        mode: 0.9,
        min: 0.8,
        max: 1.0,
        count: 3,
      },
      relevance: {
        mean: 0.8,
        median: 0.8,
        mode: null,
        min: 0.7,
        max: 0.9,
        count: 3,
      },
    });

    // Add stats for postgres tag
    tagStats.set("postgres", {
      accuracy: {
        mean: 0.7,
        median: 0.7,
        mode: 0.7,
        min: 0.6,
        max: 0.8,
        count: 3,
      },
    });

    // Convert to flat object
    const result = convertTagStatsToFlatObject(tagStats);

    // Check mongodb tag
    expect(result.mongodb).toBeDefined();
    expect(result.mongodb["accuracy.mean"]).toBe(0.9);
    expect(result.mongodb["accuracy.median"]).toBe(0.9);
    expect(result.mongodb["accuracy.mode"]).toBe(0.9);
    expect(result.mongodb["accuracy.min"]).toBe(0.8);
    expect(result.mongodb["accuracy.max"]).toBe(1.0);
    expect(result.mongodb["accuracy.count"]).toBe(3);

    expect(result.mongodb["relevance.mean"]).toBe(0.8);
    expect(result.mongodb["relevance.mode"]).toBeNull();

    // Check postgres tag
    expect(result.postgres).toBeDefined();
    expect(result.postgres["accuracy.mean"]).toBe(0.7);
    expect(result.postgres["accuracy.count"]).toBe(3);

    // Check that relevance metrics don't exist for postgres
    expect(result.postgres["relevance.mean"]).toBeUndefined();
  });

  test("returns an empty object for empty tagStats", () => {
    const tagStats = new Map();
    const result = convertTagStatsToFlatObject(tagStats);

    expect(Object.keys(result).length).toBe(0);
  });
});

describe("aggregateScoresByTag", () => {
  // Helper function to create mock eval cases with scores
  function createMockEvalCases(
    tagData: { tag: string; scores: Record<string, number[]> }[]
  ) {
    return tagData.flatMap(({ tag, scores }) => {
      return Object.entries(scores).flatMap(([scoreName, values]) => {
        return values.map((value) => ({
          evalCase: {
            input: {},
            tags: [tag],
            expected: {},
            metadata: {},
          } as EvalCase<unknown, unknown, unknown>,
          scores: { [scoreName]: value },
        }));
      });
    });
  }

  test("aggregates scores by tag correctly", () => {
    const mockEvalCases = createMockEvalCases([
      {
        tag: "mongodb",
        scores: {
          accuracy: [0.8, 0.9, 1.0],
          relevance: [0.7, 0.8, 0.9],
        },
      },
      {
        tag: "postgres",
        scores: {
          accuracy: [0.6, 0.7, 0.8],
          relevance: [0.5, 0.6, 0.7],
        },
      },
    ]);

    const result = aggregateScoresByTag(mockEvalCases, [
      "accuracy",
      "relevance",
    ]);

    // Check statistics
    const mongodbAccuracy = result.get("mongodb")?.accuracy;
    expect(mongodbAccuracy?.mean).toBeCloseTo(0.9);
    expect(mongodbAccuracy?.median).toBeCloseTo(0.9);
    expect(mongodbAccuracy?.min).toBeCloseTo(0.8);
    expect(mongodbAccuracy?.max).toBeCloseTo(1.0);

    const postgresRelevance = result.get("postgres")?.relevance;
    expect(postgresRelevance?.mean).toBeCloseTo(0.6);
    expect(postgresRelevance?.median).toBeCloseTo(0.6);
    expect(postgresRelevance?.min).toBeCloseTo(0.5);
    expect(postgresRelevance?.max).toBeCloseTo(0.7);
  });

  test("handles eval cases with missing tags", () => {
    const mockEvalCases = [
      {
        evalCase: {
          input: {},
          tags: [],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { accuracy: 0.9 },
      },
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { accuracy: 0.8 },
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases, ["accuracy"]);

    // Should only have the mongodb tag
    expect(result.size).toBe(1);
    expect(result.has("mongodb")).toBe(true);
    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy).toBeDefined();
    expect(mongodbStats?.accuracy.mean).toBe(0.8);
    expect(mongodbStats?.accuracy.count).toBe(1);
  });

  test("handles eval cases with missing scores", () => {
    const mockEvalCases = [
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { accuracy: 0.9, relevance: undefined as unknown as number },
      },
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { accuracy: undefined as unknown as number, relevance: 0.8 },
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases, [
      "accuracy",
      "relevance",
    ]);

    // Should have both score types with correct stats
    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy).toBeDefined();
    expect(mongodbStats?.accuracy.mean).toBe(0.9);
    expect(mongodbStats?.accuracy.count).toBe(1);

    expect(mongodbStats?.relevance).toBeDefined();
    expect(mongodbStats?.relevance.mean).toBe(0.8);
    expect(mongodbStats?.relevance.count).toBe(1);
  });

  test("handles empty input", () => {
    const result = aggregateScoresByTag([], ["accuracy"]);

    expect(result.size).toBe(0);
  });

  test("handles edge case with null or undefined scores", () => {
    const mockEvalCases = [
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { accuracy: null as unknown as number, relevance: 0.9 },
      },
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { accuracy: 0.8, relevance: undefined as unknown as number },
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases, [
      "accuracy",
      "relevance",
    ]);

    // Should skip null/undefined values
    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy).toBeDefined();
    expect(mongodbStats?.accuracy.mean).toBe(0.8);
    expect(mongodbStats?.accuracy.count).toBe(1);

    expect(mongodbStats?.relevance).toBeDefined();
    expect(mongodbStats?.relevance.mean).toBe(0.9);
    expect(mongodbStats?.relevance.count).toBe(1);
  });
});
