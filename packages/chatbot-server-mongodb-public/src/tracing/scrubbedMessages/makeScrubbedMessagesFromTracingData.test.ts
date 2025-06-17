import { ObjectId } from "mongodb";
import { extractTracingData } from "../extractTracingData";
import { makeScrubbedMessagesFromTracingData } from "./makeScrubbedMessagesFromTracingData";

describe("makeScrubbedMessagesFromTracingData", () => {
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
      metadata: mockTracingData.userMessage?.metadata,
      embedding: mockTracingData.userMessage?.embedding,
      embeddingModelName: "test-embedding-model",
      messagePii: undefined,
      userCommentPii: undefined,
      rejectQuery: false,
      rejectionReason: "no rejection",
      origin: "unknown",
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
});
