import { SomeMessage } from "mongodb-rag-core";
import { extractTracingData, getLlmAsAJudgeScores } from "./tracing";
import { llmDoesNotKnowMessage } from "./systemPrompt";

// Mock LLM-as-a-judge scorers
jest.mock("autoevals", () => ({
  Faithfulness: jest.fn().mockResolvedValue({
    score: 0.8,
  }),
  ContextRelevancy: jest.fn().mockResolvedValue({
    score: 0.8,
  }),
  AnswerRelevancy: jest.fn().mockResolvedValue({
    score: 0.8,
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

describe("extractTracingData", () => {
  test("should reject query", () => {
    const messages: SomeMessage[] = [
      {
        role: "user",
        rejectQuery: true,
        content: "",
      },
    ];
    const tracingData = extractTracingData(messages);
    expect(tracingData.rejectQuery).toBe(true);
    expect(tracingData.tags.includes("rejected_query")).toBe(true);
  });
  test("should extract metadata", () => {
    const messages: SomeMessage[] = [
      {
        role: "user",
        content: "",
        customData: {
          programmingLanguage: "javascript",
          mongoDbProduct: "MongoDB Atlas",
        },
      },
    ];
    const tracingData = extractTracingData(messages);
    expect(tracingData.tags.includes("javascript")).toBe(true);
    expect(tracingData.tags.includes("mongodb_atlas")).toBe(true);
  });
  test("should get number of retrieved chunks", () => {
    const messagesNoContext: SomeMessage[] = [
      {
        role: "user",
        content: "",
        contextContent: [],
      },
    ];
    const tracingData = extractTracingData(messagesNoContext);
    expect(tracingData.numRetrievedChunks).toBe(0);
    expect(tracingData.tags.includes("no_retrieved_content")).toBe(true);

    const messagesWithContext: SomeMessage[] = [
      {
        role: "user",
        content: "",
        contextContent: [
          {
            text: "",
          },
          {
            text: "",
          },
        ],
      },
    ];
    const tracingDataWithContext = extractTracingData(messagesWithContext);
    expect(tracingDataWithContext.numRetrievedChunks).toBe(2);
    expect(tracingDataWithContext.tags.includes("no_retrieved_content")).toBe(
      false
    );
  });
  test("should capture verified answer", () => {
    const messagesNoContext: SomeMessage[] = [
      {
        role: "assistant",
        content: "",
        metadata: {
          verifiedAnswer: {
            _id: "123",
            created: new Date(),
          },
        },
      },
    ];
    const tracingData = extractTracingData(messagesNoContext);
    expect(tracingData.isVerifiedAnswer).toBe(true);
    expect(tracingData.tags.includes("verified_answer")).toBe(true);
  });
  test("should capture LLM does not know", () => {
    const messagesNoContext: SomeMessage[] = [
      {
        role: "assistant",
        content: llmDoesNotKnowMessage,
      },
    ];
    const tracingData = extractTracingData(messagesNoContext);
    expect(tracingData.llmDoesNotKnow).toBe(true);
    expect(tracingData.tags.includes("llm_does_not_know")).toBe(true);
  });
});

describe("getLlmAsAJudgeScores", () => {
  const fakeBaseConfig = {
    judgeEmbeddingModel: "judgeEmbeddingModel",
    judgeModel: "judgeModel",
    openAiConfig: {
      azureOpenAi: {
        apiKey: "apiKey",
        endpoint: "endpoint",
        apiVersion: "apiVersion",
      },
    },
  } satisfies Parameters<typeof getLlmAsAJudgeScores>[0];
  const willJudge = {
    latestAssistantMessage: {
      role: "assistant",
      content: "foo",
    },
    latestUserMessage: {
      role: "user",
      content: "foo",
      contextContent: [
        {
          text: "foo",
        },
      ],
    },
    tags: [],
    isVerifiedAnswer: false,
    llmDoesNotKnow: false,
    numRetrievedChunks: 1,
    rejectQuery: false,
  } satisfies Parameters<typeof getLlmAsAJudgeScores>[1];

  it("shouldn't judge verified answer", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      isVerifiedAnswer: true,
    });
    expect(scores).toEqual(undefined);
  });
  it("shouldn't judge when no context chunks", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      numRetrievedChunks: 0,
    });
    expect(scores).toEqual(undefined);
  });
  it("shouldn't judge when query is rejected", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      rejectQuery: true,
    });
    expect(scores).toEqual(undefined);
  });
  it("shouldn't judge if no user message", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      latestUserMessage: undefined,
    });
    expect(scores).toEqual(undefined);
  });
  it("shouldn't judge if no assistant message", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      latestAssistantMessage: undefined,
    });
    expect(scores).toEqual(undefined);
  });
  it("shouldn't judge when LLM doesn't know", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      llmDoesNotKnow: true,
    });
    expect(scores).toEqual(undefined);
  });
  it("should judge for standard chatbot prompt/response", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, willJudge);
    expect(scores).toEqual({
      ContextRelevancy: 0.8,
      AnswerRelevancy: 0.8,
      Faithfulness: 0.8,
    });
  });
});
