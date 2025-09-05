import { ObjectId } from "mongodb";
import { LanguageModel } from "mongodb-rag-core/aiSdk";
import { extractTracingData } from "../extractTracingData";
import { makeScrubbedMessagesFromTracingData } from "./makeScrubbedMessagesFromTracingData";
import { analyzeMessage } from "./analyzeMessage";

// Mock the analyzeMessage function
jest.mock("./analyzeMessage", () => ({
  analyzeMessage: jest.fn().mockResolvedValue({
    topics: ["test_topic"],
    keywords: ["test_keyword"],
    sentiment: "neutral",
    relevance: 0.8,
  }),
}));

const mockAnalyzeMessage = analyzeMessage as jest.MockedFunction<
  typeof analyzeMessage
>;

describe("makeScrubbedMessagesFromTracingData", () => {
  const mockAnalyzerModel = {} as LanguageModel;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTracingData = {
    conversationId: new ObjectId(),
    tags: ["test_tag"],
    rejectQuery: false,
    isVerifiedAnswer: false,
    llmDoesNotKnow: false,
    numRetrievedChunks: 0,
    rating: undefined,
    comment: undefined,
    userMessage: {
      id: new ObjectId(),
      role: "user",
      content: "user message content",
      createdAt: new Date(),
      customData: { someData: "value" },
      metadata: { source: "test" },
      embedding: [0.1, 0.2, 0.3],
      rejectQuery: false,
    },
    userMessageIndex: 0,
    assistantMessage: {
      id: new ObjectId(),
      role: "assistant",
      content: "assistant message content",
      createdAt: new Date(),
      customData: { someData: "value" },
      metadata: { source: "test" },
    },
    firstToolMetadata: { name: "test_tool", testParam: "value" },
    contextContent: [],
    assistantMessageIndex: 1,
    rejectionReason: "no rejection",
    origin: "unknown",
  } as ReturnType<typeof extractTracingData>;

  it("should create scrubbed messages from tracing data", async () => {
    // Call the function
    const result = await makeScrubbedMessagesFromTracingData({
      tracingData: mockTracingData,
      embeddingModelName: "test-embedding-model",
      reqId: "test-req-id",
      storedMessageContent: true,
    });

    // Assertions
    expect(result).toHaveLength(2);

    // Check user message
    expect(result[0]).toMatchObject({
      _id: mockTracingData.userMessage?.id,
      conversationId: mockTracingData.conversationId,
      index: mockTracingData.userMessageIndex,
      role: "user",
      content: "user message content",
      createdAt: mockTracingData.userMessage?.createdAt,
      customData: mockTracingData.userMessage?.customData,
      pii: undefined,
      metadata: {
        ...mockTracingData.userMessage?.metadata,
        ...mockTracingData.firstToolMetadata,
      },
      embedding: mockTracingData.userMessage?.embedding,
      embeddingModelName: "test-embedding-model",
      messagePii: undefined,
      userCommentPii: undefined,
      rejectQuery: false,
    });

    // Check assistant message
    expect(result[1]).toMatchObject({
      _id: mockTracingData.assistantMessage.id,
      conversationId: mockTracingData.conversationId,
      index: mockTracingData.assistantMessageIndex,
      role: "assistant",
      content: "assistant message content",
      createdAt: mockTracingData.assistantMessage.createdAt,
      customData: mockTracingData.assistantMessage.customData,
      pii: undefined,
      metadata: mockTracingData.assistantMessage.metadata,
      messagePii: undefined,
    });
  });

  it("should perform message analysis when storedMessageContent is true", async () => {
    const result = await makeScrubbedMessagesFromTracingData({
      tracingData: mockTracingData,
      analysis: {
        model: mockAnalyzerModel,
      },
      embeddingModelName: "test-embedding-model",
      reqId: "test-req-id",
      storedMessageContent: true,
    });

    // Verify analyzeMessage was called for both user and assistant messages
    expect(mockAnalyzeMessage).toHaveBeenCalledTimes(2);
    expect(mockAnalyzeMessage).toHaveBeenCalledWith(
      "user message content",
      mockAnalyzerModel
    );
    expect(mockAnalyzeMessage).toHaveBeenCalledWith(
      "assistant message content",
      mockAnalyzerModel
    );

    // Verify the result includes analysis data
    expect(result).toHaveLength(2);
    expect(result[0].analysis).toEqual({
      topics: ["test_topic"],
      keywords: ["test_keyword"],
      sentiment: "neutral",
      relevance: 0.8,
    });
    expect(result[1].analysis).toEqual({
      topics: ["test_topic"],
      keywords: ["test_keyword"],
      sentiment: "neutral",
      relevance: 0.8,
    });
  });

  it("should not perform message analysis OR store first tool metadata when storedMessageContent is false", async () => {
    const result = await makeScrubbedMessagesFromTracingData({
      tracingData: mockTracingData,
      analysis: {
        model: mockAnalyzerModel,
      },
      embeddingModelName: "test-embedding-model",
      reqId: "test-req-id",
      storedMessageContent: false,
    });

    // Verify analyzeMessage was not called
    expect(mockAnalyzeMessage).not.toHaveBeenCalled();

    // Verify the result does not include analysis data
    expect(result).toHaveLength(2);
    expect(result[0].analysis).toBeUndefined();
    expect(result[1].analysis).toBeUndefined();

    // Verify result userMessage.metadata does not include firstToolMetadata
    expect(result[0].metadata).toEqual(mockTracingData.userMessage?.metadata);
  });
});
