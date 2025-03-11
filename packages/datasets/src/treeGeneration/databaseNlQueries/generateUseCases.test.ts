import { generateDatabaseUseCases } from "./generateUseCases";
import { sampleLlmOptions, userNodes } from "./sampleData";

// Skipping LLM call tests
describe.skip("generateDatabaseUseCases", () => {
  jest.setTimeout(300000); // Increase timeout for OpenAI API calls

  it("should generate use cases for a database user", async () => {
    for (const userNode of userNodes) {
      const useCases = await generateDatabaseUseCases(
        userNode,
        sampleLlmOptions,
        1
      );
      console.log("Use cases for user:", userNode.data.name);
      console.log(
        JSON.stringify(
          useCases.map((useCase) => useCase.data),
          null,
          2
        )
      );
    }
  });
});
