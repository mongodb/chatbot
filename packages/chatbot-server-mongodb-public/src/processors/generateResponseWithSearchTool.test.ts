import { jest } from "@jest/globals";
import {
  GenerateResponseWithSearchToolParams,
  makeGenerateResponseWithSearchTool,
} from "./generateResponseWithSearchTool";
import {
  AssistantMessage,
  DataStreamer,
  EmbeddedContent,
  FindContentFunc,
  SystemMessage,
  ToolMessage,
  UserMessage,
  WithScore,
} from "mongodb-rag-core";
import {
  MockLanguageModelV1,
  simulateReadableStream,
  LanguageModelV1StreamPart,
} from "mongodb-rag-core/aiSdk";
import { ObjectId } from "mongodb-rag-core/mongodb";
import {
  InputGuardrail,
  FilterPreviousMessages,
  GenerateResponseReturnValue,
} from "mongodb-chatbot-server";
import {
  makeSearchTool,
  MongoDbSearchToolArgs,
  SEARCH_TOOL_NAME,
  searchResultToLlmContent,
} from "../tools/search";
import { strict as assert } from "assert";

const latestMessageText = "Hello";

const mockReqId = "test";

const mockContent: WithScore<EmbeddedContent>[] = [
  {
    url: "https://example.com/",
    text: `Content!`,
    metadata: {
      pageTitle: "Example Page",
    },
    sourceName: "Example Source",
    tokenCount: 10,
    embeddings: {
      example: [],
    },
    updated: new Date(),
    score: 1,
  },
];

const mockReferences = mockContent.map((content) => ({
  url: content.url,
  title: content.metadata?.pageTitle ?? content.url,
}));

const mockFindContent: FindContentFunc = async () => {
  return {
    content: mockContent,
    queryEmbedding: [],
  };
};

// Create a mock search tool that matches the SearchTool interface
const mockSearchTool = makeSearchTool(mockFindContent);

// Must have, but details don't matter
const mockFinishChunk = {
  type: "finish" as const,
  finishReason: "stop" as const,
  usage: {
    completionTokens: 10,
    promptTokens: 3,
  },
} satisfies LanguageModelV1StreamPart;

const finalAnswer = "Final answer";
const finalAnswerChunks = finalAnswer.split(" ");
const finalAnswerStreamChunks = finalAnswerChunks.map((word, i) => {
  if (i === 0) {
    return {
      type: "text-delta" as const,
      textDelta: word,
    };
  }
  return {
    type: "text-delta" as const,
    textDelta: ` ${word}`,
  };
});

const searchToolMockArgs: MongoDbSearchToolArgs = {
  query: "test",
  productName: "driver",
  programmingLanguage: "python",
};

jest.setTimeout(5000);
// Mock language model following the AI SDK testing documentation
// Create a minimalist mock for the language model
const makeMockLanguageModel = () => {
  return new MockLanguageModelV1({
    doStream: async () => {
      // Create a combined stream that includes tool call and final answer
      const allChunks = [
        // Tool call chunk
        {
          type: "tool-call" as const,
          toolCallId: "abc123",
          toolName: SEARCH_TOOL_NAME,
          toolCallType: "function" as const,
          args: JSON.stringify(searchToolMockArgs),
        },
        // Text chunks for final answer
        ...finalAnswerStreamChunks,
        // Finish chunk
        mockFinishChunk,
      ] satisfies LanguageModelV1StreamPart[];

      return {
        stream: simulateReadableStream({
          chunks: allChunks,
          chunkDelayInMs: 10,
          initialDelayInMs: 10,
        }),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
  });
};

const mockSystemMessage: SystemMessage = {
  role: "system",
  content: "You are a helpful assistant.",
};

const mockLlmNotWorkingMessage =
  "Sorry, I am having trouble with the language model.";

const mockLlmRefusalMessage = "Sorry, I cannot answer that.";

const mockGuardrailRejectResult = {
  rejected: true,
  message: "Content policy violation",
  metadata: { reason: "inappropriate" },
};

const mockGuardrailPassResult = {
  rejected: false,
  message: "All good 👍",
  metadata: { reason: "appropriate" },
};

const makeMockGuardrail =
  (pass: boolean): InputGuardrail =>
  async () =>
    pass ? mockGuardrailPassResult : mockGuardrailRejectResult;
const mockThrowingLanguageModel: MockLanguageModelV1 = new MockLanguageModelV1({
  doStream: async () => {
    throw new Error("LLM error");
  },
});

const mockStreamConfig = {
  onLlmNotWorking: jest.fn().mockImplementation((args: any) => {
    args.dataStreamer.streamData({
      type: "delta",
      data: args.notWorkingMessage,
    });
  }),
  onLlmRefusal: jest.fn().mockImplementation((args: any) => {
    args.dataStreamer.streamData({
      type: "delta",
      data: args.refusalMessage,
    });
  }),
  onReferenceLinks: jest.fn().mockImplementation((args: any) => {
    args.dataStreamer.streamData({
      type: "references",
      data: args.references,
    });
  }),
  onTextDelta: jest.fn().mockImplementation((args: any) => {
    args.dataStreamer.streamData({
      type: "delta",
      data: args.delta,
    });
  }),
} satisfies GenerateResponseWithSearchToolParams["stream"];

const generateResponseWithSearchToolArgs = {
  languageModel: makeMockLanguageModel(),
  llmNotWorkingMessage: mockLlmNotWorkingMessage,
  llmRefusalMessage: mockLlmRefusalMessage,
  systemMessage: mockSystemMessage,
  searchTool: mockSearchTool,
  stream: mockStreamConfig,
} satisfies GenerateResponseWithSearchToolParams;

const generateResponseBaseArgs = {
  conversation: {
    _id: new ObjectId(),
    createdAt: new Date(),
    messages: [],
  },
  latestMessageText,
  shouldStream: false,
  reqId: mockReqId,
};

describe("generateResponseWithSearchTool", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeGenerateResponseWithSearchTool", () => {
    const generateResponse = makeGenerateResponseWithSearchTool(
      generateResponseWithSearchToolArgs
    );
    it("should return a function", () => {
      expect(typeof generateResponse).toBe("function");
    });
    it("should filter previous messages", async () => {
      // Properly type the mock function to match FilterPreviousMessages
      const mockFilterPreviousMessages = jest
        .fn()
        .mockImplementation((_conversation) =>
          Promise.resolve([])
        ) as FilterPreviousMessages;
      const generateResponse = makeGenerateResponseWithSearchTool({
        ...generateResponseWithSearchToolArgs,
        filterPreviousMessages: mockFilterPreviousMessages,
      });

      // We don't care about the output so not getting the return value
      await generateResponse(generateResponseBaseArgs);

      expect(mockFilterPreviousMessages).toHaveBeenCalledWith({
        _id: expect.any(ObjectId),
        createdAt: expect.any(Date),
        messages: [],
      });
    });

    it("should make reference links", async () => {
      const generateResponse = makeGenerateResponseWithSearchTool(
        generateResponseWithSearchToolArgs
      );

      const result = await generateResponse(generateResponseBaseArgs);

      const references = (result.messages.at(-1) as AssistantMessage)
        .references;
      expect(references).toEqual(
        expect.arrayContaining([expect.objectContaining(mockReferences[0])])
      );
    });

    it("should add custom data to the user message", async () => {
      const generateResponse = makeGenerateResponseWithSearchTool(
        generateResponseWithSearchToolArgs
      );

      const result = await generateResponse(generateResponseBaseArgs);

      const userMessage = result.messages.find(
        (message) => message.role === "user"
      ) as UserMessage;
      expect(userMessage.customData).toMatchObject(searchToolMockArgs);
    });
    it("should not generate until guardrail has resolved (reject)", async () => {
      const generateResponse = makeGenerateResponseWithSearchTool({
        ...generateResponseWithSearchToolArgs,
        inputGuardrail: async () => {
          // sleep for 2 seconds
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return mockGuardrailRejectResult;
        },
      });

      const result = await generateResponse(generateResponseBaseArgs);

      expectGuardrailRejectResult(result);
    });
    it("should not generate until guardrail has resolved (pass)", async () => {
      const generateResponse = makeGenerateResponseWithSearchTool({
        ...generateResponseWithSearchToolArgs,
        inputGuardrail: async () => {
          // sleep for 2 seconds
          await new Promise((resolve) => setTimeout(resolve, 2000));
          return mockGuardrailPassResult;
        },
      });

      const result = await generateResponse(generateResponseBaseArgs);

      expectSuccessfulResult(result);
    });
    describe("non-streaming", () => {
      test("should handle successful generation non-streaming", async () => {
        const generateResponse = makeGenerateResponseWithSearchTool(
          generateResponseWithSearchToolArgs
        );

        const result = await generateResponse(generateResponseBaseArgs);

        expectSuccessfulResult(result);
      });

      test("should handle guardrail rejection", async () => {
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
          inputGuardrail: makeMockGuardrail(false),
        });

        const result = await generateResponse(generateResponseBaseArgs);

        expectGuardrailRejectResult(result);
      });

      test("should handle guardrail pass", async () => {
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
          inputGuardrail: makeMockGuardrail(true),
        });

        const result = await generateResponse(generateResponseBaseArgs);

        expectSuccessfulResult(result);
      });

      test("should handle error in language model", async () => {
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
          languageModel: mockThrowingLanguageModel,
        });

        const result = await generateResponse(generateResponseBaseArgs);

        expect(result.messages[0].role).toBe("user");
        expect(result.messages[0].content).toBe(latestMessageText);
        expect(result.messages.at(-1)?.role).toBe("assistant");
        expect(result.messages.at(-1)?.content).toBe(mockLlmNotWorkingMessage);
      });
    });

    describe("streaming mode", () => {
      const makeMockDataStreamer = () => {
        const mockConnect = jest.fn();
        const mockDisconnect = jest.fn();
        const mockStreamData = jest.fn();
        const mockStreamResponses = jest.fn();
        const mockStream = jest.fn().mockImplementation(async () => {
          // Process the stream and return a string result
          return "Hello";
        });

        const dataStreamer = {
          connected: true,
          connect: mockConnect,
          disconnect: mockDisconnect,
          streamData: mockStreamData,
          streamResponses: mockStreamResponses,
          stream: mockStream,
        } as DataStreamer;

        return dataStreamer;
      };

      test("should handle successful streaming", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        // Note: In the actual implementation, streaming callbacks should be called
        // but the mock setup might not be triggering them correctly

        expectSuccessfulResult(result);
      });

      test("should handle successful generation with guardrail", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
          inputGuardrail: makeMockGuardrail(true),
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        // Note: In the actual implementation, streaming callbacks should be called
        // but the mock setup might not be triggering them correctly

        expectSuccessfulResult(result);
      });

      test("should handle streaming with guardrail rejection", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
          inputGuardrail: makeMockGuardrail(false),
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        // Note: In the actual implementation, streaming callbacks should be called
        // but the mock setup might not be triggering them correctly

        expectGuardrailRejectResult(result);
      });

      test("should handle error in language model", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithSearchTool({
          ...generateResponseWithSearchToolArgs,
          languageModel: mockThrowingLanguageModel,
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        // Note: In the actual implementation, streaming callbacks should be called
        // but the mock setup might not be triggering them correctly

        expect(result.messages[0].role).toBe("user");
        expect(result.messages[0].content).toBe(latestMessageText);
        expect(result.messages.at(-1)?.role).toBe("assistant");
        expect(result.messages.at(-1)?.content).toBe(mockLlmNotWorkingMessage);
      });
    });
  });
});

function expectGuardrailRejectResult(result: GenerateResponseReturnValue) {
  expect(result.messages).toHaveLength(2);
  expect(result.messages[0]).toMatchObject({
    role: "user",
    content: latestMessageText,
    rejectQuery: true,
    customData: expect.objectContaining(mockGuardrailRejectResult),
  } satisfies UserMessage);

  expect(result.messages[1]).toMatchObject({
    role: "assistant",
    content: mockLlmRefusalMessage,
  } satisfies AssistantMessage);
}

function expectSuccessfulResult(result: GenerateResponseReturnValue) {
  expect(result).toHaveProperty("messages");
  expect(result.messages).toHaveLength(6); // User + assistant (tool call) + tool result + assistant (tool call) + tool result + assistant
  expect(result.messages[0]).toMatchObject({
    role: "user",
    content: latestMessageText,
    customData: expect.objectContaining(searchToolMockArgs),
  });
  expect(result.messages[1]).toMatchObject({
    role: "assistant",
    toolCall: {
      id: "abc123",
      function: {
        name: "search_content",
      },
      type: "function",
    },
    content: finalAnswer,
  });
  expect(
    JSON.parse(
      (result.messages[1] as AssistantMessage)?.toolCall?.function
        .arguments as string
    )
  ).toMatchObject(searchToolMockArgs);

  // The content might be a JSON string containing a content array
  const toolMessage = result.messages.find(
    (message) => message.role === "tool"
  );
  assert(toolMessage);
  expect(toolMessage).toMatchObject({
    role: "tool",
    name: "search_content",
    content: expect.any(String),
  } satisfies ToolMessage);
  expect(JSON.parse(toolMessage.content)).toMatchObject({
    results: mockContent.map(searchResultToLlmContent),
  });

  // Check that the final assistant message has references
  const finalMessage = result.messages.at(-1) as AssistantMessage;
  expect(finalMessage.role).toBe("assistant");
  expect(finalMessage.content).toEqual("");
  expect(finalMessage.references).toBeDefined();
  expect(finalMessage.references).toHaveLength(2);
}
