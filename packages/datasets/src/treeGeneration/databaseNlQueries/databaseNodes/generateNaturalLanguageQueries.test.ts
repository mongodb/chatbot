import { generateNaturalLanguageQueries } from "./generateNaturalLanguageQueries";
import { makeSampleLlmOptions, useCaseNodes, userNode } from "./sampleData";
import PromisePool from "@supercharge/promise-pool";

// Skipping LLM call tests
describe.skip("generateNaturalLanguageQueries", () => {
  jest.setTimeout(300000); // Increase timeout for OpenAI API calls

  it("should generate natural language queries for a database use case", async () => {
    const { results: nlQueries } = await PromisePool.for(useCaseNodes).process(
      async (useCase) => {
        const nlQueries = await generateNaturalLanguageQueries(
          useCase,
          makeSampleLlmOptions(),
          1
        );
        console.log(
          `Natural language queries for ${userNode.data.name} use case: ${useCase.data.title}`
        );
        console.log(
          JSON.stringify(
            nlQueries.map((nlQuery) => nlQuery.data),
            null,
            2
          )
        );
        return nlQueries;
      }
    );
    const allNlQueries = nlQueries.flat();
    console.log(
      `Generated ${allNlQueries.length} natural language queries for ${userNode.data.name}`
    );
  });
});
