import { describe, it, expect } from "vitest";
import { MockLanguageModelV2 } from "mongodb-rag-core/aiSdk";
import { makeAnalyzeCases } from "./analyzeCases";
import { makeMockEmbeddingModel } from "./relevance.test";

describe("analyzeCases", () => {
  it("analyzes multiple cases and returns relevance and quality", async () => {
    const cases = [
      { prompt: "test prompt 1", response: "test response 1" },
      { prompt: "test prompt 2", response: "test response 2" },
    ];

    const mockRating = {
      answer_fit: { score: 5, rationale: "" },
      answer_reasonableness: { score: 5, rationale: "" },
      business_impact: { score: 2, rationale: "" },
      prompt_clarity: { score: 5, rationale: "" },
      prompt_knowledge_assumption: { score: 3, rationale: "" },
    };

    const analyzeCases = makeAnalyzeCases({
      embeddingModels: [makeMockEmbeddingModel()],
      generatorModel: new MockLanguageModelV2({
        doGenerate: async () => ({
          content: [{ type: "text", text: JSON.stringify(["q1", "q2", "q3"]) }],
          finishReason: "stop",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          warnings: [],
        }),
      }),
      judgementModel: new MockLanguageModelV2({
        doGenerate: async () => ({
          content: [{ type: "text", text: JSON.stringify(mockRating) }],
          finishReason: "stop",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          warnings: [],
        }),
      }),
    });

    const results = await analyzeCases({ cases, concurrency: 2 });

    expect(results).toHaveLength(2);
    for (const result of results) {
      expect(result.quality).toEqual(mockRating);

      expect(result.relevance.generated_prompts).toHaveLength(3);
      expect(Object.keys(result.relevance.prompt_embeddings)).toContain(
        "test-embedder"
      );
      expect(result.relevance.scores.cos_similarity).toBeGreaterThanOrEqual(-1);
      expect(result.relevance.scores.cos_similarity).toBeLessThanOrEqual(1);
      expect(result.relevance.scores.norm_sq_mag_diff).toBeGreaterThanOrEqual(
        0
      );
    }
  });
});
