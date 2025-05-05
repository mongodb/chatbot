import { ObjectId } from "mongodb-rag-core/mongodb";
import { BaseCase } from "./EvalCases";
import { materializeExperimentResultsByCase } from "./materializeExperimentResultsByCase";
import { ResultsByExperiment } from "./reportBenchmarkResults";

describe("materializeExperimentResultsByCase", () => {
  // Create valid ObjectId hex strings (24 characters)
  const mockId1 = "507f1f77bcf86cd799439011";
  const mockId2 = "507f1f77bcf86cd799439012";

  // Create mock experiment results
  const mockResultsByExperiment: ResultsByExperiment = {
    experiment1: [
      {
        id: mockId1,
        input: "test input 1",
        expected: "expected output 1",
        tags: ["tag1", "tag2"],
        output: "actual output 1",
        metadata: {},
        scores: {
          accuracy: 0.8,
          relevance: 0.9,
        },
      },
      {
        id: mockId2,
        input: "test input 2",
        expected: "expected output 2",
        tags: ["tag2", "tag3"],
        output: "actual output 2",
        metadata: {},
        scores: {
          accuracy: 0.7,
          relevance: 0.85,
        },
      },
    ],
    experiment2: [
      {
        id: mockId1,
        input: "test input 1",
        expected: "expected output 1",
        tags: ["tag1", "tag2"],
        output: "different output for experiment 2",
        metadata: {},
        scores: {
          accuracy: 0.75,
          relevance: 0.95,
        },
      },
      {
        id: mockId2,
        input: "test input 2",
        expected: "expected output 2",
        tags: ["tag2", "tag3"],
        output: "different output for experiment 2",
        metadata: {},
        scores: {
          accuracy: 0.65,
          relevance: 0.8,
        },
      },
    ],
  };

  it("should group results by case id", () => {
    const results = materializeExperimentResultsByCase(mockResultsByExperiment);

    // Should return the correct number of cases
    expect(results.length).toBe(2);

    // Find the cases by id
    const case1 = results.find((c) => c.id.toString() === mockId1);
    const case2 = results.find((c) => c.id.toString() === mockId2);

    // Verify both cases exist
    expect(case1).toBeDefined();
    expect(case2).toBeDefined();

    // Verify case1 has results from both experiments
    expect(Object.keys(case1!.results)).toHaveLength(2);
    expect(case1!.results).toHaveProperty("experiment1");
    expect(case1!.results).toHaveProperty("experiment2");

    // Verify case2 has results from both experiments
    expect(Object.keys(case2!.results)).toHaveLength(2);
    expect(case2!.results).toHaveProperty("experiment1");
    expect(case2!.results).toHaveProperty("experiment2");
  });

  it("should correctly map experiment outputs to case results", () => {
    const results = materializeExperimentResultsByCase(mockResultsByExperiment);

    // Find the cases by id
    const case1 = results.find((c) => c.id.toString() === mockId1);

    // Verify experiment1 results for case1
    expect(case1!.results.experiment1.model).toBe("experiment1");
    expect(case1!.results.experiment1.response).toBe(
      JSON.stringify("actual output 1")
    );
    expect(case1!.results.experiment1.metrics).toEqual({
      accuracy: 0.8,
      relevance: 0.9,
    });

    // Verify experiment2 results for case1
    expect(case1!.results.experiment2.model).toBe("experiment2");
    expect(case1!.results.experiment2.response).toBe(
      JSON.stringify("different output for experiment 2")
    );
    expect(case1!.results.experiment2.metrics).toEqual({
      accuracy: 0.75,
      relevance: 0.95,
    });
  });

  it("should correctly handle scores", () => {
    const results = materializeExperimentResultsByCase(mockResultsByExperiment);

    // Find the cases by id
    const case2 = results.find((c) => c.id.toString() === mockId2);

    // Check metrics are correctly extracted from scores
    expect(case2!.results.experiment1.metrics).toEqual({
      accuracy: 0.7,
      relevance: 0.85,
    });

    expect(case2!.results.experiment2.metrics).toEqual({
      accuracy: 0.65,
      relevance: 0.8,
    });
  });

  it("should handle missing or null values", () => {
    // Create mock with missing and null values
    const mockWithMissingValues: ResultsByExperiment = {
      experiment3: [
        {
          id: "507f1f77bcf86cd799439013", // Valid ObjectId
          input: "test input 3",
          expected: null as any,
          tags: undefined,
          output: undefined,
          metadata: {},
          scores: {
            accuracy: null,
            relevance: 0.5,
          },
        },
      ],
    };

    const results = materializeExperimentResultsByCase(mockWithMissingValues);
    expect(results.length).toBe(1);

    const case3 = results[0];
    expect(case3.expected).toBe("");
    expect(case3.tags).toEqual([]);
    expect(case3.results.experiment3.response).toBe("");

    // Should only include numeric scores
    expect(case3.results.experiment3.metrics).toEqual({
      relevance: 0.5,
    });
    expect(case3.results.experiment3.metrics).not.toHaveProperty("accuracy");
  });
});
