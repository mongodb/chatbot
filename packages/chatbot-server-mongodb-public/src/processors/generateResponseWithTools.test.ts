import { jest } from "@jest/globals";
import {
  GenerateResponseWithToolsParams,
  makeGenerateResponseWithTools,
} from "./generateResponseWithTools";
import {
  AssistantMessage,
  DataStreamer,
  EmbeddedContent,
  FindContentFunc,
  SystemMessage,
  ToolMessage,
  UserMessage,
  WithScore,
  PersistedPage,
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
import {
  FETCH_PAGE_TOOL_NAME,
  makeFetchPageTool,
  MongoDbFetchPageToolArgs,
} from "../tools/fetchPage";
import { MongoDbPageStore } from "mongodb-rag-core";
import { strict as assert } from "assert";

const latestMessageText = "Hello";

const mockReqId = "test";

const mockContent: WithScore<EmbeddedContent>[] = [
  {
    url: "https://example.com/",
    text: `Content!`,
    metadata: {
      pageTitle: "Example Embedded Content",
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

const mockPageContent = {
  url: "https://example.com/",
  body: "Example page body",
  format: "md",
  sourceName: "test source name",
  metadata: {},
  title: "Example Page",
  updated: new Date(),
  action: "created",
} as PersistedPage;

const mockLoadPage: MongoDbPageStore["loadPage"] = async (args) => {
  if (args?.urls?.[0] === "https://example.com/") {
    return mockPageContent;
  }
  return null;
};

const mockFindContent: FindContentFunc = async () => {
  return {
    content: mockContent,
    queryEmbedding: [],
  };
};

// Create a mock search tool that matches the SearchTool interface
const mockSearchTool = makeSearchTool(mockFindContent);

// Create a mock fetch_page tool that matches the SearchTool interface
const mockFetchPageTool = makeFetchPageTool(mockLoadPage, mockFindContent);

// What the references are expected to look like
const mockReferences = [
  {
    url: mockPageContent.url,
    title: mockPageContent.title ?? mockPageContent.url,
    metadata: {
      ...mockPageContent.metadata,
      sourceName: mockPageContent.sourceName,
    },
  },
  {
    url: mockContent[0].url,
    title: mockContent[0].metadata?.pageTitle ?? mockContent[0].url,
    metadata: {
      // sourceName/tags are not available makeDefaultReferenceLinks
      tags: [],
      sourceName: undefined,
    },
  },
];

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

// Note: have to make this constructor b/c the ReadableStream
// can only be used once successfully.
const makeFinalAnswerStream = () =>
  simulateReadableStream({
    chunks: [
      ...finalAnswerStreamChunks,
      mockFinishChunk,
    ] satisfies LanguageModelV1StreamPart[],
    chunkDelayInMs: 100,
    initialDelayInMs: 100,
  });

const fetchPageToolMockArgs: MongoDbFetchPageToolArgs = {
  pageUrl: "https://example.com/",
  query: "example",
};

const searchToolMockArgs: MongoDbSearchToolArgs = {
  query: "test",
  productName: "driver",
  programmingLanguage: "python",
};

const makeFetchPageToolCallStream = () =>
  simulateReadableStream({
    chunks: [
      {
        type: "tool-call" as const,
        toolCallId: "abc001",
        toolName: FETCH_PAGE_TOOL_NAME,
        toolCallType: "function" as const,
        args: JSON.stringify(fetchPageToolMockArgs),
      },
      mockFinishChunk,
    ] satisfies LanguageModelV1StreamPart[],
    chunkDelayInMs: 100,
    initialDelayInMs: 100,
  });

const makeSearchToolCallStream = () =>
  simulateReadableStream({
    chunks: [
      {
        type: "tool-call" as const,
        toolCallId: "abc002",
        toolName: SEARCH_TOOL_NAME,
        toolCallType: "function" as const,
        args: JSON.stringify(searchToolMockArgs),
      },
      mockFinishChunk,
    ] satisfies LanguageModelV1StreamPart[],
    chunkDelayInMs: 100,
    initialDelayInMs: 100,
  });

jest.setTimeout(10000);
// Mock language model following the AI SDK testing documentation
// Create a minimalist mock for the language model
const makeMockLanguageModel = () => {
  // On first call, return fetch_page tool call stream
  // On second call, return search_content tool call stream
  // On third call, return final answer stream
  // On subsequent calls, return final answer
  let counter = 0;
  const doStreamCalls = [
    async () => {
      return {
        stream: makeFetchPageToolCallStream(),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
    async () => {
      return {
        stream: makeSearchToolCallStream(),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    async () => {
      return {
        stream: makeFinalAnswerStream(),
        rawCall: { rawPrompt: null, rawSettings: {} },
      };
    },
  ];
  return new MockLanguageModelV1({
    doStream: () => {
      const streamCallPromise = doStreamCalls[counter]();
      if (counter < doStreamCalls.length) {
        counter++;
      }
      return streamCallPromise;
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

const makeGenerateResponseWithToolsArgs = () =>
  ({
    languageModel: makeMockLanguageModel(),
    llmNotWorkingMessage: mockLlmNotWorkingMessage,
    llmRefusalMessage: mockLlmRefusalMessage,
    systemMessage: mockSystemMessage,
    maxSteps: 3,
    searchTool: mockSearchTool,
    fetchPageTool: mockFetchPageTool,
  } satisfies Partial<GenerateResponseWithToolsParams>);

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
describe("generateResponseWithTools", () => {
  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeGenerateResponseWithTools", () => {
    const generateResponse = makeGenerateResponseWithTools(
      makeGenerateResponseWithToolsArgs()
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
      const generateResponse = makeGenerateResponseWithTools({
        ...makeGenerateResponseWithToolsArgs(),
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
      const generateResponse = makeGenerateResponseWithTools(
        makeGenerateResponseWithToolsArgs()
      );

      const result = await generateResponse(generateResponseBaseArgs);

      const references = (result.messages.at(-1) as AssistantMessage)
        .references;
      expect(references).toMatchObject(mockReferences);
    });

    it("should add custom data to the user message", async () => {
      const generateResponse = makeGenerateResponseWithTools(
        makeGenerateResponseWithToolsArgs()
      );

      const result = await generateResponse(generateResponseBaseArgs);

      const userMessage = result.messages.find(
        (message) => message.role === "user"
      ) as UserMessage;
      expect(userMessage.customData).toMatchObject(searchToolMockArgs);
    });
    it("should not generate until guardrail has resolved (reject)", async () => {
      const generateResponse = makeGenerateResponseWithTools({
        ...makeGenerateResponseWithToolsArgs(),
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
      const generateResponse = makeGenerateResponseWithTools({
        ...makeGenerateResponseWithToolsArgs(),
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
        const generateResponse = makeGenerateResponseWithTools(
          makeGenerateResponseWithToolsArgs()
        );

        const result = await generateResponse(generateResponseBaseArgs);

        expectSuccessfulResult(result);
      });

      test("should handle guardrail rejection", async () => {
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          inputGuardrail: makeMockGuardrail(false),
        });

        const result = await generateResponse(generateResponseBaseArgs);

        expectGuardrailRejectResult(result);
      });

      test("should handle guardrail pass", async () => {
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          inputGuardrail: makeMockGuardrail(true),
        });

        const result = await generateResponse(generateResponseBaseArgs);

        expectSuccessfulResult(result);
      });

      test("should handle error in language model", async () => {
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
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
      // Create a mock DataStreamer implementation
      const makeMockDataStreamer = () => {
        const mockStreamData = jest.fn();
        const mockConnect = jest.fn();
        const mockDisconnect = jest.fn();
        const mockStream = jest.fn().mockImplementation(async () => {
          // Process the stream and return a string result
          return "Hello";
        });
        const dataStreamer = {
          connected: false,
          connect: mockConnect,
          disconnect: mockDisconnect,
          streamData: mockStreamData,
          stream: mockStream,
        } as DataStreamer;

        return dataStreamer;
      };
      test("should handle successful streaming", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithTools(
          makeGenerateResponseWithToolsArgs()
        );

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockDataStreamer.streamData).toHaveBeenCalledTimes(3);
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          data: "Final",
          type: "delta",
        });
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          type: "references",
          data: expect.any(Array),
        });
        expectSuccessfulResult(result);
      });

      test("should handle successful generation with guardrail", async () => {
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          inputGuardrail: makeMockGuardrail(true),
        });
        const mockDataStreamer = makeMockDataStreamer();

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockDataStreamer.streamData).toHaveBeenCalledTimes(3);
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          data: "Final",
          type: "delta",
        });
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          type: "references",
          data: expect.any(Array),
        });

        expectSuccessfulResult(result);
      });

      test("should handle streaming with guardrail rejection", async () => {
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          inputGuardrail: makeMockGuardrail(false),
        });
        const mockDataStreamer = makeMockDataStreamer();

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expectGuardrailRejectResult(result);
        expect(mockDataStreamer.streamData).toHaveBeenCalledTimes(1);
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          data: mockLlmRefusalMessage,
          type: "delta",
        });
      });

      test("should handle error in language model", async () => {
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          languageModel: mockThrowingLanguageModel,
        });

        const dataStreamer = makeMockDataStreamer();
        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer,
        });

        expect(dataStreamer.streamData).toHaveBeenCalledTimes(1);
        expect(dataStreamer.streamData).toHaveBeenCalledWith({
          data: mockLlmNotWorkingMessage,
          type: "delta",
        });

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
    customData: mockGuardrailRejectResult,
  } satisfies UserMessage);

  expect(result.messages[1]).toMatchObject({
    role: "assistant",
    content: mockLlmRefusalMessage,
  } satisfies AssistantMessage);
}

function expectSuccessfulResult(result: GenerateResponseReturnValue) {
  expect(result).toHaveProperty("messages");
  // User -> Assistant (fetch_page tool call) + fetch_page tool result ->
  // Assistant (search tool call) + search tool result -> Assistant msg (final answer)
  expect(result.messages).toHaveLength(6);

  expect(result.messages[0]).toMatchObject({
    role: "user",
    content: latestMessageText,
  });

  expect(result.messages[1]).toMatchObject({
    role: "assistant",
    toolCall: {
      id: "abc001",
      function: {
        name: FETCH_PAGE_TOOL_NAME,
      },
      type: "function",
    },
    content: "",
  });
  expect(
    JSON.parse(
      (result.messages[1] as AssistantMessage)?.toolCall?.function
        .arguments as string
    )
  ).toMatchObject(fetchPageToolMockArgs);

  const fetchPageToolResponseMessage = result.messages[2];
  assert(fetchPageToolResponseMessage);
  expect(fetchPageToolResponseMessage).toMatchObject({
    role: "tool",
    name: FETCH_PAGE_TOOL_NAME,
    content: "Example page body",
  });

  expect(result.messages[3]).toMatchObject({
    role: "assistant",
    toolCall: {
      id: "abc002",
      function: {
        name: SEARCH_TOOL_NAME,
      },
      type: "function",
    },
    content: "",
  });
  expect(
    JSON.parse(
      (result.messages[3] as AssistantMessage)?.toolCall?.function
        .arguments as string
    )
  ).toMatchObject(searchToolMockArgs);

  const searchToolResponseMessage = result.messages[4];
  assert(searchToolResponseMessage);
  expect(searchToolResponseMessage).toMatchObject({
    role: "tool",
    name: "search_content",
    content: expect.any(String),
  } satisfies ToolMessage);
  expect(JSON.parse(searchToolResponseMessage.content)).toMatchObject({
    results: mockContent.map(searchResultToLlmContent),
  });

  expect(result.messages[5]).toMatchObject({
    role: "assistant",
    content: finalAnswer,
  });
  expect((result.messages[5] as AssistantMessage).references).toEqual(
    mockReferences
  );
}
