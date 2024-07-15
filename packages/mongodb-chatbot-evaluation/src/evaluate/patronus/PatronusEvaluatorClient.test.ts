import {
  PatronusEvaluatorClient,
  PatronusClientParams,
} from "./PatronusEvaluatorClient";
import assert from "assert/strict";

const testData = {
  input: "What is the capital of France?",
  contexts: [
    "Paris is the capital of France.",
    "Berlin is the capital of Germany.",
  ],
  output: "The capital of France is Paris",
  tags: { project: "integration-test-project" },
};
describe("PatronusEvaluatorClient Integration Tests", () => {
  const apiKey = process.env.PATRONUS_API_KEY;
  assert(apiKey, "Patronus API key must be defined");
  const clientParams: PatronusClientParams = {
    apiKey,
    globalTags: { globalTag: "hello globe!" },
  };

  let client: PatronusEvaluatorClient;
  const { input, contexts, tags, output } = testData;

  beforeAll(() => {
    client = new PatronusEvaluatorClient(clientParams);
  });

  it("should evaluate answer relevance v2", async () => {
    const result = await client.evaluateAnswerRelevanceV2(input, output, tags);

    expect(result).toBeTruthy();
  });

  it("should evaluate context relevance v1", async () => {
    const result = await client.evaluateContextRelevanceV1(
      input,
      contexts,
      tags
    );

    expect(result).toBeTruthy();
  });

  it("should evaluate hallucination v2", async () => {
    const result = await client.evaluateHallucinationV2(
      input,
      output,
      contexts,
      tags
    );

    expect(result).toBeTruthy();
  });
});
