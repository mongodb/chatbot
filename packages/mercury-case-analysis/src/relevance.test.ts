import { describe, it, expect } from "vitest";
import { assessRelevance } from "./relevance";
import { TextGenerator } from "./generateText";
import { MockEmbeddingModelV2 } from "mongodb-rag-core/aiSdk";

export function makeMockEmbeddingModel(
  modelName = "test-embedder"
): MockEmbeddingModelV2<string> {
  function hashToUnitInterval(input: string, seed: number): number {
    let h = 2166136261 ^ seed;
    for (let i = 0; i < input.length; i++) {
      h ^= input.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    // Convert to [0, 1]
    const u = (h >>> 0) / 0xffffffff;
    // Map to [-1, 1]
    return u * 2 - 1;
  }

  async function embed({ text }: { text: string }): Promise<number[]> {
    return [
      hashToUnitInterval(text, 1),
      hashToUnitInterval(text, 101),
      hashToUnitInterval(text, 10007),
    ];
  }

  return {
    specificationVersion: "v2",
    provider: "test",
    modelId: modelName,
    maxEmbeddingsPerCall: 1,
    supportsParallelCalls: false,
    doEmbed: async ({ values }) => {
      const embeddings = await Promise.all(
        values.map((text) => embed({ text }))
      );
      return { embeddings };
    },
  } satisfies MockEmbeddingModelV2<string>;
}

// Simple deterministic generator that returns N copies of provided strings
export function makeGeneratorReturning(
  values: string[]
): TextGenerator<string> {
  return async ({ n = values.length }: { n?: number }) => {
    const out: string[] = [];
    for (let i = 0; i < n; i++) out.push(values[i % values.length]);
    return out;
  };
}

describe("assessRelevance", () => {
  const singleEmbeddingModel = [makeMockEmbeddingModel()];

  it("yields perfect similarity when generated prompts equal the original", async () => {
    const prompt = "When to use $pull and $push mongodb";
    const generateText = makeGeneratorReturning([prompt]);

    const result = await assessRelevance({
      prompt,
      response: "irrelevant for deterministic generator",
      embeddingModels: singleEmbeddingModel,
      generateText,
    });

    expect(result.generated_prompts).toHaveLength(3);
    expect(result.scores.cos_similarity).toBe(1);
    expect(result.scores.norm_sq_mag_diff).toBe(0);
  });

  it("yields lower similarity for unrelated generated prompts", async () => {
    const prompt = "When to use $pull and $push mongodb";
    const generateText = makeGeneratorReturning([
      "xxxxxxxxxx",
      "yyyyyyyyyy",
      "zzzzzzzzzz",
    ]);

    const result = await assessRelevance({
      prompt,
      response: "irrelevant for deterministic generator",
      embeddingModels: singleEmbeddingModel,
      generateText,
    });

    expect(result.generated_prompts).toHaveLength(3);
    expect(result.scores.cos_similarity).toBeLessThan(1);
    expect(result.scores.norm_sq_mag_diff).toBeGreaterThan(0);
    expect(result.scores.cos_similarity).toBeGreaterThanOrEqual(-1);
    expect(result.scores.cos_similarity).toBeLessThanOrEqual(1);
  });

  it("averages correctly across multiple embedding models", async () => {
    const prompt = "When to use $pull and $push mongodb";
    const generateText = makeGeneratorReturning([prompt]);

    const twoEmbeddingModels = [
      makeMockEmbeddingModel("embedder-a"),
      makeMockEmbeddingModel("embedder-b"),
    ];

    const result = await assessRelevance({
      prompt,
      response: "irrelevant for deterministic generator",
      embeddingModels: twoEmbeddingModels,
      generateText,
    });

    expect(result.generated_prompts).toHaveLength(3);
    // With identical prompts, cosine similarity should still be perfect
    // and norm squared magnitude difference should be 0, even with multiple models
    expect(result.scores.cos_similarity).toBe(1);
    expect(result.scores.norm_sq_mag_diff).toBe(0);
  });
});
