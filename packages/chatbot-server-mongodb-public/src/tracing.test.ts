import { Message } from "mongodb-rag-core";
import { extractTracingData, getLlmAsAJudgeScores } from "./tracing";
import { llmDoesNotKnowMessage } from "./systemPrompt";
import { ObjectId } from "mongodb-rag-core/mongodb";

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
  const msgId = new ObjectId();
  const baseUserMessage: Message = {
    role: "user",
    content: "foo",
    createdAt: new Date(),
    id: new ObjectId(),
  };
  const baseAssistantMessage: Message = {
    role: "assistant",
    content: "foo",
    createdAt: new Date(),
    id: msgId,
  };
  test("should reject query", () => {
    const messages: Message[] = [
      {
        ...baseUserMessage,
        rejectQuery: true,
      },
      baseAssistantMessage,
    ];
    const tracingData = extractTracingData(messages, msgId);
    expect(tracingData.rejectQuery).toBe(true);
    expect(tracingData.tags.includes("rejected_query")).toBe(true);
  });
  test("should extract metadata", () => {
    const messages: Message[] = [
      {
        ...baseUserMessage,
        customData: {
          programmingLanguage: "javascript",
          mongoDbProduct: "MongoDB Atlas",
        },
      },
      baseAssistantMessage,
    ];
    const tracingData = extractTracingData(messages, msgId);
    expect(tracingData.tags.includes("javascript")).toBe(true);
    expect(tracingData.tags.includes("mongodb_atlas")).toBe(true);
  });
  test("should get number of retrieved chunks", () => {
    const messagesNoContext: Message[] = [
      {
        ...baseUserMessage,
        contextContent: [],
      },
      baseAssistantMessage,
    ];
    const tracingData = extractTracingData(messagesNoContext, msgId);
    expect(tracingData.numRetrievedChunks).toBe(0);
    expect(tracingData.tags.includes("no_retrieved_content")).toBe(true);

    const messagesWithContext: Message[] = [
      {
        ...baseUserMessage,
        contextContent: [
          {
            text: "",
          },
          {
            text: "",
          },
        ],
      },
      baseAssistantMessage,
    ];
    const tracingDataWithContext = extractTracingData(
      messagesWithContext,
      msgId
    );
    expect(tracingDataWithContext.numRetrievedChunks).toBe(2);
    expect(tracingDataWithContext.tags.includes("no_retrieved_content")).toBe(
      false
    );
  });
  test("should capture verified answer", () => {
    const messagesNoContext: Message[] = [
      baseUserMessage,
      {
        ...baseAssistantMessage,
        metadata: {
          verifiedAnswer: {
            _id: "123",
            created: new Date(),
          },
        },
      },
    ];
    const tracingData = extractTracingData(messagesNoContext, msgId);
    expect(tracingData.isVerifiedAnswer).toBe(true);
    expect(tracingData.tags.includes("verified_answer")).toBe(true);
  });
  test("should capture LLM does not know", () => {
    const messagesNoContext: Message[] = [
      baseUserMessage,
      {
        ...baseAssistantMessage,
        content: llmDoesNotKnowMessage,
      },
    ];
    const tracingData = extractTracingData(messagesNoContext, msgId);
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
      id: new ObjectId(),
      createdAt: new Date(),
    },
    latestUserMessage: {
      role: "user",
      content: "foo",
      contextContent: [
        {
          text: "foo",
        },
      ],
      id: new ObjectId(),
      createdAt: new Date(),
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
