import { MockLanguageModelV2 } from "mongodb-rag-core/aiSdk";
import { makeGenerateRating } from "./rating";

describe("generateRating", () => {
  it("should generate a rating", async () => {
    const generateRating = makeGenerateRating({
      model: new MockLanguageModelV2({
        modelId: "test",
        doGenerate: async () => ({
          content: [
            {
              type: "text",
              text: JSON.stringify({
                answer_fit: { score: 5, rationale: "" },
                answer_reasonableness: { score: 5, rationale: "" },
                business_impact: { score: 5, rationale: "" },
                prompt_clarity: { score: 5, rationale: "" },
                prompt_knowledge_assumption: { score: 5, rationale: "" },
              }),
            },
          ],
          finishReason: "stop",
          usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
          warnings: [],
        }),
      }),
    });
    const rating = await generateRating({
      prompt: "What is the capital of France?",
      response: "Paris",
    });
    expect(rating).toEqual({
      answer_fit: { score: 5, rationale: "" },
      answer_reasonableness: { score: 5, rationale: "" },
      business_impact: { score: 5, rationale: "" },
      prompt_clarity: { score: 5, rationale: "" },
      prompt_knowledge_assumption: { score: 5, rationale: "" },
    });
  });
});
