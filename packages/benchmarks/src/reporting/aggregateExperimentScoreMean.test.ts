import { EvalCase } from "mongodb-rag-core/braintrust";
import { ExperimentResult } from "./getBraintrustExperimentResults";
import { aggregateExperimentScoreMean } from "./aggregateExperimentScoreMean";

describe("aggregateExperimentScoreMean", () => {
  test("calculates mean score correctly from experiment results", () => {
    // Define mock experiment results with a specific score type
    type ScoreTypes = ["accuracy"];

    const mockResults: ExperimentResult<
      EvalCase<unknown, unknown, unknown>,
      unknown,
      ScoreTypes
    >[] = [
      {
        input: {},
        tags: ["tag1"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.8 },
      },
      {
        input: {},
        tags: ["tag2"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.9 },
      },
      {
        input: {},
        tags: ["tag3"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.7 },
      },
    ];

    // Call the function with the mock data
    const result = aggregateExperimentScoreMean(mockResults, "accuracy");

    // Verify the results
    expect(result).not.toBeNull();
    if (result) {
      expect(result.mean).toBeCloseTo(0.8);
      expect(result.count).toBe(3);
      expect(result.min).toBe(0.7);
      expect(result.max).toBe(0.9);
    }
  });

  test("handles experiment results with missing scores", () => {
    // Define mock experiment results with some missing scores
    type ScoreTypes = ["accuracy"];

    const mockResults: ExperimentResult<
      EvalCase<unknown, unknown, unknown>,
      unknown,
      ScoreTypes
    >[] = [
      {
        input: {},
        tags: ["tag1"],
        expected: {},
        metadata: {},
        scores: { accuracy: 0.8 },
      },
      {
        input: {},
        tags: ["tag2"],
        expected: {},
        metadata: {},
        scores: { accuracy: null }, // Null score
      },
      {
        input: {},
        tags: ["tag3"],
        expected: {},
        metadata: {},
        // Missing scores property
      },
    ];

    // Call the function with the mock data
    const result = aggregateExperimentScoreMean(mockResults, "accuracy");

    // Verify the results - should only include the valid score
    expect(result).not.toBeNull();
    if (result) {
      expect(result.mean).toBe(0.8);
      expect(result.count).toBe(1);
    }
  });

  test("returns null when no valid scores are found", () => {
    // Define mock experiment results with no valid scores
    type ScoreTypes = ["accuracy"];

    const mockResults: ExperimentResult<
      EvalCase<unknown, unknown, unknown>,
      unknown,
      ScoreTypes
    >[] = [
      {
        input: {},
        tags: ["tag1"],
        expected: {},
        metadata: {},
        scores: { accuracy: null },
      },
      {
        input: {},
        tags: ["tag2"],
        expected: {},
        metadata: {},
        // Missing scores property
      },
    ];

    // Call the function with the mock data
    const result = aggregateExperimentScoreMean(mockResults, "accuracy");

    // Verify the result is null
    expect(result).toBeNull();
  });
});
