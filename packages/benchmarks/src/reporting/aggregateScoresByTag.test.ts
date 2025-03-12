import { EvalCase } from "mongodb-rag-core/braintrust";
import { aggregateScoresByTag } from "./aggregateScoresByTag";
import { ExperimentResult } from "./getBraintrustExperimentResults";

describe("aggregateScoresByTag", () => {
  test("aggregates scores by tag correctly", () => {
    const mockEvalCases = createMockEvalCases([
      {
        tag: "mongodb",
        scores: {
          accuracy: [0.8, 0.9, 1.0],
          relevance: [0.7, 0.8, 0.9],
        },
        input: "foo",
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
        input: {},
        tags: ["mongodb"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.8 },
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases, ["accuracy"]);

    // Should only have the mongodb tag
    expect(result.size).toBe(1);
    expect(result.has("mongodb")).toBe(true);
    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy.count).toBe(1);
  });

  test("handles eval cases with missing scores", () => {
    type ScoreTypes = ["accuracy", "relevance"];

    const mockEvalCases: ExperimentResult<
      EvalCase<unknown, unknown, unknown>,
      unknown,
      ScoreTypes
    >[] = [
      {
        input: {},
        tags: ["mongodb"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.9, relevance: null } as Record<
          "accuracy" | "relevance",
          number | null
        >,
      },
      {
        input: {},
        tags: ["mongodb"],
        expected: {},
        metadata: {},
        scores: { accuracy: null, relevance: 0.8 } as Record<
          "accuracy" | "relevance",
          number | null
        >, // Different score type
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases, [
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
        input: {},
        tags: ["mongodb"],
        expected: {},
        metadata: {},
        // No scores property
      },
      {
        input: {},
        tags: ["mongodb"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.8 },
      },
    ];

    const result = aggregateScoresByTag(mockEvalCases as any, ["accuracy"]);

    const mongodbStats = result.get("mongodb");
    expect(mongodbStats?.accuracy.count).toBe(1); // Only one case has scores
  });
});

// Helper function to create mock eval cases with scores
function createMockEvalCases<T extends string>(
  tagData: { tag: string; scores: Record<T, number[]>; input?: unknown }[]
): ExperimentResult<EvalCase<unknown, unknown, unknown>, unknown, [T]>[] {
  return tagData.flatMap(({ tag, scores, input = {} }) => {
    return Object.entries(scores).flatMap(([scoreName, scoreValues]) => {
      const typedScoreValues = scoreValues as number[];
      return typedScoreValues.map((value: number) => {
        // Create the base EvalCase properties
        const result: ExperimentResult<
          EvalCase<unknown, unknown, unknown>,
          unknown,
          [T]
        > = {
          input,
          tags: [tag],
          expected: {},
          metadata: {},
          // Create a properly typed scores object
          scores: { [scoreName as T]: value } as Record<T, number | null>,
        };
        return result;
      });
    });
  });
}
