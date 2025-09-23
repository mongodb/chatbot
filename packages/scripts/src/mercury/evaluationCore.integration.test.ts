/**
 Integration tests for the evaluation core module.
 These tests use real MongoDB connections but mock external APIs.
 */

import { ObjectId } from "mongodb-rag-core/mongodb";
import { generateText } from "mongodb-rag-core/aiSdk";
import { makeReferenceAlignment } from "benchmarks";
import {
  evaluatePromptModelPairs,
  createEvaluationConfig,
  EvaluationTask,
} from "./evaluationCore";
import { getModel } from "./models";
import type { MercuryPrompt } from "./database";

// Mock external dependencies
jest.mock("mongodb-rag-core/aiSdk");
jest.mock("benchmarks");

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;
const mockMakeReferenceAlignment =
  makeReferenceAlignment as jest.MockedFunction<typeof makeReferenceAlignment>;

describe("evaluationCore integration tests", () => {
  const mockPrompts: MercuryPrompt[] = [
    {
      _id: new ObjectId(),
      type: "question-answer",
      tags: ["mongodb", "basics"],
      name: "What is MongoDB Atlas?",
      prompt: [{ role: "user", content: "What is MongoDB Atlas?" }],
      expected: "MongoDB Atlas is a cloud-based database service.",
      metadata: {
        category: "product",
        profoundPromptId: "atlas-001",
      },
      analysis: {
        quality: {
          answer_fit: { score: 0.95 },
          answer_reasonableness: { score: 0.95 },
          business_impact: { score: 0.9 },
          prompt_clarity: { score: 0.95 },
          prompt_knowledge_assumption: { score: 0.9 },
        },
        relevance: 0.95,
      },
    },
    {
      _id: new ObjectId(),
      type: "question-answer",
      tags: ["mongodb", "aggregation"],
      name: "How does aggregation work?",
      prompt: [
        { role: "user", content: "How does aggregation work in MongoDB?" },
      ],
      expected: "Aggregation is a pipeline-based data processing framework.",
      metadata: {
        category: "technical",
        profoundPromptId: "agg-001",
      },
      analysis: {
        quality: {
          answer_fit: { score: 0.85 },
          answer_reasonableness: { score: 0.9 },
          business_impact: { score: 0.8 },
          prompt_clarity: { score: 0.88 },
          prompt_knowledge_assumption: { score: 0.85 },
        },
        relevance: 0.88,
      },
    },
    {
      _id: new ObjectId(),
      type: "question-answer",
      tags: ["mongodb", "indexing"],
      name: "What are compound indexes?",
      prompt: [
        { role: "user", content: "What are compound indexes in MongoDB?" },
      ],
      expected: "Compound indexes are indexes on multiple fields.",
      metadata: {
        category: "performance",
        profoundPromptId: "idx-001",
      },
      analysis: {
        quality: {
          answer_fit: { score: 0.92 },
          answer_reasonableness: { score: 0.9 },
          business_impact: { score: 0.85 },
          prompt_clarity: { score: 0.95 },
          prompt_knowledge_assumption: { score: 0.88 },
        },
        relevance: 0.92,
      },
    },
  ];

  const modelConfigs = [
    getModel("gpt-4o"),
    getModel("gpt-4o-mini"),
    getModel("claude-35-sonnet"),
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful generation for all models
    mockGenerateText.mockImplementation(async ({ model }) => {
      // Simulate different response styles for different models
      const responses = {
        "gpt-4o":
          "MongoDB Atlas is a fully managed cloud database service that makes deploying, scaling, and managing MongoDB databases easier.",
        "gpt-4o-mini": "MongoDB Atlas is a cloud database service.",
        "claude-3-5-sonnet-20241022":
          "MongoDB Atlas provides a cloud-based MongoDB hosting solution with automated scaling and management.",
      };

      return {
        text:
          responses[model as keyof typeof responses] ||
          "Generic response about MongoDB.",
        finishReason: "stop" as const,
        usage: { promptTokens: 15, completionTokens: 25 },
      };
    });

    // Mock scoring with varying results
    const mockScorer = jest
      .fn()
      .mockImplementation(async ({ output, expected }) => {
        // Simulate realistic scoring based on response quality
        const response = output.response.toLowerCase();
        const expectedText = expected.reference.toLowerCase();

        let score = 0.5; // Base score

        // Simple scoring logic for testing
        if (response.includes("mongodb")) score += 0.2;
        if (response.includes("atlas") && expectedText.includes("atlas"))
          score += 0.2;
        if (response.includes("cloud") && expectedText.includes("cloud"))
          score += 0.1;

        return {
          score: Math.min(score, 1.0),
          metadata: {
            rationale: `Response scored ${score} based on content relevance.`,
          },
        };
      });

    mockMakeReferenceAlignment.mockReturnValue(mockScorer);
  });

  describe("end-to-end evaluation workflow", () => {
    it("should evaluate multiple prompts against multiple models", async () => {
      const evaluationConfig = createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: getModel("gpt-4.1"),
      });

      // Create evaluation tasks (3 prompts × 3 models = 9 tasks)
      const tasks: EvaluationTask[] = mockPrompts.flatMap((prompt) =>
        modelConfigs.map((model) => ({ prompt, model }))
      );

      const result = await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 3,
      });

      // Should have 9 successful results
      expect(result.results).toHaveLength(9);
      expect(result.errors).toHaveLength(0);

      // Verify all prompts were processed
      const processedPromptIds = new Set(
        result.results.map((r) => r.promptId.toString())
      );
      expect(processedPromptIds.size).toBe(3);

      // Verify all models were used
      const processedModels = new Set(result.results.map((r) => r.model));
      expect(processedModels.size).toBe(3);

      // Verify results have expected structure
      result.results.forEach((result) => {
        expect(result._id).toBeInstanceOf(ObjectId);
        expect(result.promptId).toBeInstanceOf(ObjectId);
        expect(typeof result.model).toBe("string");
        expect(typeof result.developer).toBe("string");
        expect(result.date).toBeInstanceOf(Date);
        expect(typeof result.response).toBe("string");
        expect(result.metrics.referenceAlignment).toBeDefined();
        expect(typeof result.metrics.referenceAlignment.score).toBe("number");
      });
    });

    it("should handle partial failures gracefully", async () => {
      const evaluationConfig = createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: getModel("gpt-4.1"),
      });

      // Make some generations fail
      mockGenerateText.mockImplementation(async ({ model }) => {
        if (model === "gpt-4o-mini") {
          throw new Error("Rate limit exceeded");
        }
        return {
          text: "MongoDB Atlas is a cloud database service.",
          finishReason: "stop" as const,
          usage: { promptTokens: 15, completionTokens: 25 },
        };
      });

      const tasks: EvaluationTask[] = mockPrompts.flatMap((prompt) =>
        modelConfigs.map((model) => ({ prompt, model }))
      );

      const result = await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 2,
      });

      // Should have 6 successes (3 prompts × 2 successful models)
      // and 3 failures (3 prompts × 1 failing model)
      expect(result.results).toHaveLength(6);
      expect(result.errors).toHaveLength(3);

      // All errors should be for gpt-4o-mini
      result.errors.forEach((error) => {
        expect(error.model).toBe("gpt-4o-mini");
      });
    });

    it("should maintain data consistency across evaluations", async () => {
      const evaluationConfig = createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: getModel("gpt-4.1"),
      });

      const singleTask: EvaluationTask = {
        prompt: mockPrompts[0],
        model: modelConfigs[0],
      };

      // Run the same evaluation multiple times
      const results = await Promise.all([
        evaluatePromptModelPairs([singleTask], evaluationConfig),
        evaluatePromptModelPairs([singleTask], evaluationConfig),
        evaluatePromptModelPairs([singleTask], evaluationConfig),
      ]);

      // Each run should produce consistent results
      results.forEach((result) => {
        expect(result.results).toHaveLength(1);
        expect(result.errors).toHaveLength(0);

        const evaluation = result.results[0];
        expect(evaluation.promptId).toEqual(mockPrompts[0]._id);
        expect(evaluation.model).toBe(modelConfigs[0].label);
        expect(evaluation.developer).toBe(modelConfigs[0].developer);
      });
    });

    it("should handle progress tracking correctly", async () => {
      const evaluationConfig = createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: getModel("gpt-4.1"),
      });

      const tasks: EvaluationTask[] = mockPrompts.slice(0, 2).map((prompt) => ({
        prompt,
        model: modelConfigs[0],
      }));

      const progressCalls: Array<[number, number]> = [];
      const onProgress = (completed: number, total: number) => {
        progressCalls.push([completed, total]);
      };

      await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 1,
        onProgress,
      });

      expect(progressCalls).toEqual([
        [1, 2],
        [2, 2],
      ]);
    });
  });

  describe("real-world scenario simulation", () => {
    it("should handle a typical batch evaluation scenario", async () => {
      const evaluationConfig = createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: getModel("gpt-4.1"),
      });

      // Simulate a realistic batch: 3 prompts, 2 models
      const tasks: EvaluationTask[] = mockPrompts.flatMap((prompt) =>
        modelConfigs.slice(0, 2).map((model) => ({ prompt, model }))
      );

      const startTime = Date.now();
      const result = await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 3,
      });
      const endTime = Date.now();

      // Verify results
      expect(result.results).toHaveLength(6); // 3 prompts × 2 models
      expect(result.errors).toHaveLength(0);

      // Verify reasonable execution time (should be concurrent)
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(5000); // Should complete in reasonable time

      // Verify result diversity
      const uniquePromptIds = new Set(
        result.results.map((r) => r.promptId.toString())
      );
      const uniqueModels = new Set(result.results.map((r) => r.model));

      expect(uniquePromptIds.size).toBe(3);
      expect(uniqueModels.size).toBe(2);

      // Verify all results have valid scores
      result.results.forEach((result) => {
        expect(result.metrics.referenceAlignment.score).toBeGreaterThanOrEqual(
          0
        );
        expect(result.metrics.referenceAlignment.score).toBeLessThanOrEqual(1);
        expect(result.metrics.referenceAlignment.rationale).toBeTruthy();
      });
    });
  });
});
