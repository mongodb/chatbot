import { Conversation } from "mongodb-rag-core";
import { makeAddMessageToConversationUpdateTrace } from "./addMessageToConversation";
import { ObjectId } from "mongodb-rag-core/mongodb";
import { generateObject } from "mongodb-rag-core/aiSdk";

// Mock the AI SDK generateObject function
jest.mock("mongodb-rag-core/aiSdk", () => ({
  ...jest.requireActual("mongodb-rag-core/aiSdk"),
  generateObject: jest.fn().mockResolvedValue({ 
    object: {
      topics: [],
      keywords: [],
      sentiment: "test",
      relevance: 0.5
    }
  }),
}));

const mockGenerateObject = generateObject as jest.MockedFunction<typeof generateObject>;

describe("makeAddMessageToConversationUpdateTrace", () => {
  const baseConversation: Conversation = {
    _id: new ObjectId(),
    messages: [
      {
        role: "user",
        content: "test",
        id: new ObjectId(),
        createdAt: new Date(),
      },
      {
        role: "assistant",
        content: "test",
        id: new ObjectId(),
        createdAt: new Date(),
      },
    ],
    createdAt: new Date(),
  } as const;

  const reqId = new ObjectId().toString();

  const mockLogger = {
    updateSpan: jest.fn(),
  } as any;

  const mockScrubbedMessageStore = {
    insertScrubbedMessages: jest.fn(),
  } as any;

  const mockAnalyzerModel = {} as any;

  const updateTrace = makeAddMessageToConversationUpdateTrace({
    k: 1,
    braintrustLogger: mockLogger,
    scrubbedMessageStore: mockScrubbedMessageStore,
    analyzerModel: mockAnalyzerModel,
    embeddingModelName: "test",
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("should update the trace", async () => {
    await updateTrace({
      traceId: baseConversation.messages[1].id.toString(),
      conversation: baseConversation,
      reqId,
    });
    expect(mockLogger.updateSpan).toHaveBeenCalled();
    expect(mockScrubbedMessageStore.insertScrubbedMessages).toHaveBeenCalled();
    expect(mockGenerateObject).toHaveBeenCalled();
  });
  it("should only update scrubbed messages if storeMessageContent is false", async () => {
    await updateTrace({
      traceId: baseConversation.messages[1].id.toString(),
      conversation: {
        ...baseConversation,
        storeMessageContent: false,
      },
      reqId,
    });
    expect(mockLogger.updateSpan).not.toHaveBeenCalled();
    expect(mockScrubbedMessageStore.insertScrubbedMessages).toHaveBeenCalled();
    expect(mockGenerateObject).not.toHaveBeenCalled();
  });
});
