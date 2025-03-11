import { EvalCase } from "mongodb-rag-core/braintrust";
import { aggregateScoresByTag, calculateStats } from "./aggregateScoresByTag";

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

describe("aggregateScoresByTag", () => {
  // Helper function to create mock eval cases with scores
  function createMockEvalCases<T extends string>(
    tagData: { tag: string; scores: Record<T, number[]> }[]
  ): {
    evalCase: EvalCase<unknown, unknown, unknown>;
    scores: Record<string, number>;
  }[] {
    return tagData.flatMap(({ tag, scores }) => {
      return Object.entries(scores).flatMap(([scoreName, scoreValues]) => {
        const typedScoreValues = scoreValues as number[];
        return typedScoreValues.map((value: number) => ({
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

    const result = aggregateScoresByTag(mockEvalCases as any, ["accuracy"]);

    // Should only have the mongodb tag
    expect(result.size).toBe(1);
    expect(result.has("mongodb")).toBe(true);
    const mongodbStats = result.get("mongodb");
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
        scores: { accuracy: 0.9 },
      },
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        scores: { relevance: 0.8 }, // Different score type
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases as any, [
      "accuracy",
      "relevance",
    ]);

    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy.count).toBe(1);
    expect(mongodbStats?.relevance.count).toBe(1);
  });

  test("handles optional scores property", () => {
    const mockEvalCases = [
      {
        evalCase: {
          input: {},
          tags: ["mongodb"],
          expected: {},
          metadata: {},
        } as EvalCase<unknown, unknown, unknown>,
        // No scores property
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

    const result = aggregateScoresByTag(mockEvalCases as any, ["accuracy"]);

    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy.count).toBe(1); // Only one case has scores
  });
});
