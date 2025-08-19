import { MockLanguageModelV2 } from "mongodb-rag-core/aiSdk";
import { suggestRewrite } from "./suggestRewrite";

const mockGeneratorModel = new MockLanguageModelV2({
  modelId: "test",
  doGenerate: async () => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            prompt: "What is the capital of France?",
            response: "The capital of France is Paris.",
          }),
        },
      ],
      finishReason: "stop",
      usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
      warnings: [],
    };
  },
});

describe("suggestRewrite", () => {
  it("should suggest a rewrite", async () => {
    const rewrite = await suggestRewrite({
      generatorModel: mockGeneratorModel,
      prompt: "capital of france",
      response:
        "There are many beautiful and historic cities in Europe and often they are the capital of their respective country. For example, London is the capital of England and Paris is the capital of France.",
      guidance:
        "Make the response more concise. There is extraneous information about Europe and London, England.",
    });
    expect(rewrite).toEqual({
      prompt: "What is the capital of France?",
      response: "The capital of France is Paris.",
    });
  });
});
