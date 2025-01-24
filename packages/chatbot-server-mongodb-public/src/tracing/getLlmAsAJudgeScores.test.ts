import { getLlmAsAJudgeScores } from "./getLlmAsAJudgeScores";
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
    assistantMessage: {
      role: "assistant",
      content: "foo",
      createdAt: new Date(),
      id: new ObjectId(),
    },
    userMessage: {
      role: "user",
      content: "foo",
      contextContent: [
        {
          text: "foo",
        },
      ],
      createdAt: new Date(),
      id: new ObjectId(),
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
      userMessage: undefined,
    });
    expect(scores).toEqual(undefined);
  });
  it("shouldn't judge if no assistant message", async () => {
    const scores = await getLlmAsAJudgeScores(fakeBaseConfig, {
      ...willJudge,
      assistantMessage: undefined,
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
