import {
  PatronusEvaluatorClient,
  PatronusClientParams,
  PatronusEvaluationApiResult,
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

const expected = {
  status: "success",
  evaluation_result: {
    id: expect.any(String),
    explanation: expect.any(String),
    app: expect.any(String),
    score_normalized: 1,
    pass: true,
  },
} satisfies Partial<PatronusEvaluationApiResult>;
describe.skip("PatronusEvaluatorClient Integration Tests", () => {
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

    expect(result).toMatchObject(expected);
  });

  it("should evaluate context relevance v1", async () => {
    const result = await client.evaluateContextRelevanceV1(
      input,
      contexts,
      tags
    );

    expect(result).toMatchObject(expected);
  });

  it("should evaluate hallucination v2", async () => {
    const result = await client.evaluateHallucinationV2(
      input,
      output,
      contexts,
      tags
    );

    expect(result).toMatchObject(expected);
  });
});
