import { ObjectId } from "mongodb-rag-core/mongodb";
import { OpenAI } from "mongodb-rag-core/openai";
import { generateText } from "mongodb-rag-core/aiSdk";
import { makeReferenceAlignment } from "benchmarks";
import {
  evaluatePromptWithModel,
  evaluatePromptModelPairs,
  createEvaluationConfig,
  EvaluationTask,
  EvaluationConfig,
} from "./evaluationCore";
import { GenerationFailedError, ScoringFailedError } from "./errors";
import type { MercuryPrompt } from "./database";
import { ModelConfig } from "mongodb-rag-core/models";

// Mock dependencies
jest.mock("mongodb-rag-core/aiSdk");
jest.mock("mongodb-rag-core/openai");
jest.mock("benchmarks");

const mockGenerateText = generateText as jest.MockedFunction<
  typeof generateText
>;
const mockMakeReferenceAlignment =
  makeReferenceAlignment as jest.MockedFunction<typeof makeReferenceAlignment>;
const mockOpenAI = OpenAI as jest.MockedClass<typeof OpenAI>;

describe("evaluationCore", () => {
  const mockPrompt: MercuryPrompt = {
    _id: new ObjectId(),
    type: "test",
    tags: ["test"],
    name: "Test Prompt",
    prompt: [{ role: "user", content: "What is MongoDB?" }],
    expected: "MongoDB is a NoSQL database.",
    metadata: {
      category: "databases",
      profoundPromptId: "test-123",
    },
    analysis: {
      quality: {
        answer_fit: { score: 0.8 },
        answer_reasonableness: { score: 0.9 },
        business_impact: { score: 0.7 },
        prompt_clarity: { score: 0.9 },
        prompt_knowledge_assumption: { score: 0.8 },
      },
      relevance: 0.9,
    },
  };

  const mockModel: ModelConfig = {
    label: "gpt-4o",
    deployment: "gpt-4o",
    developer: "OpenAI",
    provider: "braintrust",
  };

  const mockJudgmentModel: ModelConfig = {
    label: "gpt-4.1",
    deployment: "gpt-4.1",
    developer: "OpenAI",
    provider: "braintrust",
  };

  let mockOpenAIInstance: jest.Mocked<OpenAI>;
  let evaluationConfig: EvaluationConfig;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup OpenAI mock
    mockOpenAIInstance = {
      chat: jest.fn().mockReturnValue({}),
    } as any;
    mockOpenAI.mockImplementation(() => mockOpenAIInstance);

    evaluationConfig = createEvaluationConfig({
      braintrustProxyEndpoint: "https://test-endpoint.com",
      braintrustApiKey: "test-api-key",
      judgmentModel: mockJudgmentModel,
    });
  });

  describe("createEvaluationConfig", () => {
    it("should create a valid evaluation configuration", () => {
      const config = createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: mockJudgmentModel,
      });

      expect(config.inferenceClient).toBeInstanceOf(OpenAI);
      expect(config.scoringClient).toBeInstanceOf(OpenAI);
      expect(config.judgmentModel).toBe(mockJudgmentModel);
    });

    it("should create OpenAI clients with correct configuration", () => {
      createEvaluationConfig({
        braintrustProxyEndpoint: "https://test-endpoint.com",
        braintrustApiKey: "test-api-key",
        judgmentModel: mockJudgmentModel,
      });

      expect(mockOpenAI).toHaveBeenCalledWith({
        baseURL: "https://test-endpoint.com",
        apiKey: "test-api-key",
      });
    });
  });

  describe("evaluatePromptWithModel", () => {
    const evaluationTask: EvaluationTask = {
      prompt: mockPrompt,
      model: mockModel,
    };

    it("should successfully evaluate a prompt-model pair", async () => {
      // Mock successful generation
      mockGenerateText.mockResolvedValue({
        text: "MongoDB is a popular NoSQL database.",
        finishReason: "stop",
      } as any);

      // Mock successful scoring
      const mockScorer = jest.fn().mockResolvedValue({
        score: 0.9,
        metadata: { rationale: "Good response" },
      });
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const result = await evaluatePromptWithModel(
        evaluationTask,
        evaluationConfig
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.promptId).toBe(mockPrompt._id);
        expect(result.result.model).toBe(mockModel.label);
        expect(result.result.developer).toBe(mockModel.developer);
        expect(result.result.response).toBe(
          "MongoDB is a popular NoSQL database."
        );
        expect(result.result.metrics.referenceAlignment.score).toBe(0.9);
        expect(result.result.metrics.referenceAlignment.rationale).toBe(
          "Good response"
        );
        expect(result.result.metrics.referenceAlignment.judgementModel).toBe(
          mockJudgmentModel.label
        );
      }
    });

    it("should handle generation errors", async () => {
      const generationError = new Error("API rate limit exceeded");
      mockGenerateText.mockRejectedValue(generationError);

      const result = await evaluatePromptWithModel(
        evaluationTask,
        evaluationConfig
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(GenerationFailedError);
        expect(result.error.prompt).toBe(mockPrompt);
        expect(result.error.model).toBe(mockModel.label);
        expect(result.error.error).toBe(generationError);
      }
    });

    it("should handle scoring errors", async () => {
      // Mock successful generation
      mockGenerateText.mockResolvedValue({
        text: "MongoDB is a popular NoSQL database.",
        finishReason: "stop",
      } as any);

      // Mock scoring error
      const scoringError = new Error("Scoring service unavailable");
      const mockScorer = jest.fn().mockRejectedValue(scoringError);
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const result = await evaluatePromptWithModel(
        evaluationTask,
        evaluationConfig
      );

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeInstanceOf(ScoringFailedError);
        expect(result.error.prompt).toBe(mockPrompt);
        expect(result.error.model).toBe(mockModel.label);
        expect(result.error.error).toBe(scoringError);
      }
    });

    it("should handle null scores gracefully", async () => {
      mockGenerateText.mockResolvedValue({
        text: "MongoDB is a popular NoSQL database.",
        finishReason: "stop",
      } as any);

      const mockScorer = jest.fn().mockResolvedValue({
        score: null,
        metadata: { rationale: "Could not determine score" },
      });
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const result = await evaluatePromptWithModel(
        evaluationTask,
        evaluationConfig
      );

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.metrics.referenceAlignment.score).toBe(-1);
        expect(result.result.metrics.referenceAlignment.label).toBeUndefined();
      }
    });
  });

  describe("evaluatePromptModelPairs", () => {
    const tasks: EvaluationTask[] = [
      { prompt: mockPrompt, model: mockModel },
      {
        prompt: { ...mockPrompt, _id: new ObjectId(), name: "Test Prompt 2" },
        model: { ...mockModel, label: "gpt-4o-mini" },
      },
    ];

    it("should evaluate multiple tasks successfully", async () => {
      mockGenerateText.mockResolvedValue({
        text: "MongoDB is a popular NoSQL database.",
        finishReason: "stop",
      } as any);

      const mockScorer = jest.fn().mockResolvedValue({
        score: 0.9,
        metadata: { rationale: "Good response" },
      });
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const result = await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 2,
      });

      expect(result.results).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
      expect(result.results[0].promptId).toBe(tasks[0].prompt._id);
      expect(result.results[1].promptId).toBe(tasks[1].prompt._id);
    });

    it("should handle mixed success and failure scenarios", async () => {
      // First call succeeds, second fails
      mockGenerateText
        .mockResolvedValueOnce({
          text: "MongoDB is a popular NoSQL database.",
          finishReason: "stop",
        } as any)
        .mockRejectedValueOnce(new Error("Generation failed"));

      const mockScorer = jest.fn().mockResolvedValue({
        score: 0.9,
        metadata: { rationale: "Good response" },
      });
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const result = await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 2,
      });

      expect(result.results).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBeInstanceOf(GenerationFailedError);
    });

    it("should call progress callback correctly", async () => {
      mockGenerateText.mockResolvedValue({
        text: "MongoDB is a popular NoSQL database.",
        finishReason: "stop",
      } as any);

      const mockScorer = jest.fn().mockResolvedValue({
        score: 0.9,
        metadata: { rationale: "Good response" },
      });
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const onProgress = jest.fn();
      await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 1,
        onProgress,
      });

      expect(onProgress).toHaveBeenCalledWith(1, 2);
      expect(onProgress).toHaveBeenCalledWith(2, 2);
    });

    it("should respect concurrency limits", async () => {
      const slowGenerateText = jest.fn().mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  text: "MongoDB is a popular NoSQL database.",
                  finishReason: "stop",
                }),
              100
            )
          )
      );
      mockGenerateText.mockImplementation(slowGenerateText);

      const mockScorer = jest.fn().mockResolvedValue({
        score: 0.9,
        metadata: { rationale: "Good response" },
      });
      mockMakeReferenceAlignment.mockReturnValue(mockScorer);

      const start = Date.now();
      await evaluatePromptModelPairs(tasks, evaluationConfig, {
        concurrency: 1, // Force sequential execution
      });
      const duration = Date.now() - start;

      // With concurrency 1, tasks should run sequentially, taking ~200ms
      expect(duration).toBeGreaterThan(180);
    });
  });
});
