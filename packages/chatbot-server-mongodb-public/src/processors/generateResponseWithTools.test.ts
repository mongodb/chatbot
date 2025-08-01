import { jest } from "@jest/globals";
import {
  GenerateResponseWithToolsParams,
  makeGenerateResponseWithTools,
} from "./generateResponseWithTools";
import { makeMongoDbReferences } from "../processors/makeMongoDbReferences";
import {
  AssistantMessage,
  DataStreamer,
  EmbeddedContent,
  FindContentFunc,
  ToolMessage,
  UserMessage,
  WithScore,
  PersistedPage,
} from "mongodb-rag-core";
import {
  simulateReadableStream,
  LanguageModel,
  JSONSchema7,
  MockLanguageModelV2,
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
import { systemPrompt } from "../systemPrompt";
import { OpenAI } from "mongodb-rag-core/openai";

const latestMessageText = "Hello";

const mockReqId = "test";

const mockContent: WithScore<EmbeddedContent>[] = [
  {
    url: "example.com",
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
  url: "example.com",
  body: "Example page body",
  format: "md",
  sourceName: "test source name",
  metadata: {},
  title: "Example Page",
  updated: new Date(),
  action: "created",
} satisfies PersistedPage;

const mockLoadPage: MongoDbPageStore["loadPage"] = async () => {
  return mockPageContent;
};

const mockFindContent: FindContentFunc = async () => {
  return {
    content: mockContent,
    queryEmbedding: [],
  };
};

// Create a mock search tool that matches the SearchTool interface
const mockSearchTool = makeSearchTool({
  findContent: mockFindContent,
  makeReferences: makeMongoDbReferences,
});

// Create a mock fetch_page tool that matches the SearchTool interface
const mockFetchPageTool = makeFetchPageTool({
  loadPage: mockLoadPage,
  findContent: mockFindContent,
  makeReferences: makeMongoDbReferences,
});

// What the references are expected to look like
const mockReferences = [
  {
    url: `https://${mockPageContent.url}/`,
    title: mockPageContent.title ?? `https://${mockPageContent.url}/`,
    metadata: {
      tags: [],
      sourceName: mockPageContent.sourceName,
    },
  },
  {
    url: `https://${mockContent[0].url}/`,
    title:
      mockContent[0].metadata?.pageTitle ?? `https://${mockContent[0].url}/`,
    metadata: {
      // sourceName/tags are not available makeDefaultReferenceLinks
      tags: [],
      sourceName: mockContent[0].sourceName,
    },
  },
];

// Extract the stream part type from the actual language model object type
type LanguageModelObject = Exclude<LanguageModel, string>;
type LanguageModelV2StreamPart = Awaited<
  ReturnType<LanguageModelObject["doStream"]>
>["stream"] extends ReadableStream<infer T>
  ? T
  : never;

// Must have, but details don't matter
const mockFinishChunk: LanguageModelV2StreamPart = {
  type: "finish" as const,
  finishReason: "stop" as const,
  usage: {
    inputTokens: 10,
    outputTokens: 20,
    totalTokens: 30,
  },
};

const finalAnswer = "Final answer";
const finalAnswerChunks = finalAnswer.split(" ");
const finalAnswerStreamChunks: LanguageModelV2StreamPart[] =
  finalAnswerChunks.map((word, i) => {
    if (i === 0) {
      return {
        type: "text-delta" as const,
        id: `text-1`,
        delta: word,
      };
    }
    return {
      type: "text-delta" as const,
      id: `text-1`,
      delta: ` ${word}`,
    };
  });

// Note: have to make this constructor b/c the ReadableStream
// can only be used once successfully.
const makeFinalAnswerStream = () =>
  simulateReadableStream({
    chunks: [
      { type: "text-start", id: "text-1" },
      ...finalAnswerStreamChunks,
      { type: "text-end", id: "text-1" },
      mockFinishChunk,
    ] satisfies LanguageModelV2StreamPart[],
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
        input: JSON.stringify(fetchPageToolMockArgs),
      },
      mockFinishChunk,
    ] satisfies LanguageModelV2StreamPart[],
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
        input: JSON.stringify(searchToolMockArgs),
      },
      mockFinishChunk,
    ] satisfies LanguageModelV2StreamPart[],
    chunkDelayInMs: 100,
    initialDelayInMs: 100,
  });

jest.setTimeout(10000);

// Mock language model following the AI SDK testing documentation
// Create a minimalist mock for the language model
const makeMockLanguageModel = (
  doStreamCalls: (() => ReadableStream<LanguageModelV2StreamPart>)[] = [
    () => makeFetchPageToolCallStream(),
    () => makeSearchToolCallStream(),
    () => makeFinalAnswerStream(),
  ]
): LanguageModel => {
  // On first call, return fetch_page tool call stream
  // On second call, return search_content tool call stream
  // On third call, return final answer stream
  // On subsequent calls, return final answer
  let counter = 0;

  return new MockLanguageModelV2({
    doStream: async () => {
      // 1. fetch page
      // 2. search content
      // 3... final answer
      const streamData = doStreamCalls[counter]();

      if (counter < doStreamCalls.length) {
        counter++;
      }

      return {
        stream: streamData,
      };
    },
  });
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
const mockThrowingLanguageModel: LanguageModel = {
  doGenerate: async () => {
    throw new Error("LLM error: should always fail");
  },
  doStream: async () => {
    throw new Error("LLM error: should always fail");
  },
  provider: "test",
  modelId: "test",
  specificationVersion: "v2" as const,
  supportedUrls: {} as Record<string, RegExp[]>,
};

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
} satisfies GenerateResponseWithToolsParams["stream"];

const makeGenerateResponseWithToolsArgs = () =>
  ({
    languageModel: makeMockLanguageModel(),
    llmNotWorkingMessage: mockLlmNotWorkingMessage,
    llmRefusalMessage: mockLlmRefusalMessage,
    searchTool: mockSearchTool,
    fetchPageTool: mockFetchPageTool,
    maxSteps: 5,
    stream: mockStreamConfig,
    makeSystemPrompt: () => {
      return {
        role: "system",
        content: "",
      };
    },
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
      expect(references).toEqual(
        expect.arrayContaining([expect.objectContaining(mockReferences[0])])
      );
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
        const generateResponse = makeGenerateResponseWithTools(
          makeGenerateResponseWithToolsArgs()
        );

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockStreamConfig.onTextDelta).toHaveBeenCalledWith({
          chunkId: expect.any(String),
          dataStreamer: mockDataStreamer,
          delta: expect.any(String),
          textPartId: expect.any(String),
        });
        expect(mockStreamConfig.onReferenceLinks).toHaveBeenCalledWith({
          dataStreamer: mockDataStreamer,
          references: expect.any(Array),
          textPartId: expect.any(String),
        });

        expectSuccessfulResult(result);
      });

      test("should handle successful generation with guardrail", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          inputGuardrail: makeMockGuardrail(true),
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockStreamConfig.onTextDelta).toHaveBeenCalledWith({
          chunkId: expect.any(String),
          dataStreamer: mockDataStreamer,
          delta: expect.any(String),
          textPartId: expect.any(String),
        });
        expect(mockStreamConfig.onReferenceLinks).toHaveBeenCalledWith({
          dataStreamer: mockDataStreamer,
          references: expect.any(Array),
          textPartId: expect.any(String),
        });

        expectSuccessfulResult(result);
      });

      test("should handle streaming with guardrail rejection", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          inputGuardrail: makeMockGuardrail(false),
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockStreamConfig.onLlmRefusal).toHaveBeenCalledWith({
          dataStreamer: mockDataStreamer,
          refusalMessage: mockLlmRefusalMessage,
        });

        expectGuardrailRejectResult(result);
      });

      test("should handle error in language model", async () => {
        const mockDataStreamer = makeMockDataStreamer();
        const generateResponse = makeGenerateResponseWithTools({
          ...makeGenerateResponseWithToolsArgs(),
          languageModel: mockThrowingLanguageModel,
        });

        const result = await generateResponse({
          ...generateResponseBaseArgs,
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockStreamConfig.onLlmNotWorking).toHaveBeenCalledWith({
          dataStreamer: mockDataStreamer,
          notWorkingMessage: mockLlmNotWorkingMessage,
        });

        expect(result.messages[0].role).toBe("user");
        expect(result.messages[0].content).toBe(latestMessageText);
        expect(result.messages.at(-1)?.role).toBe("assistant");
        expect(result.messages.at(-1)?.content).toBe(mockLlmNotWorkingMessage);
      });
    });
  });
  describe("custom tool calling", () => {
    const mockCustomTool: OpenAI.FunctionDefinition = {
      name: "getAge",
      description: "Get the age of a person",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name", "age"],
      } satisfies JSONSchema7,
    };
    const mockCustomToolArgs = {
      name: "John Doe",
      age: 30,
    };
    const makeCustomToolCallStream = () =>
      simulateReadableStream({
        chunks: [
          {
            type: "tool-call" as const,
            toolCallId: "abc001",
            toolName: mockCustomTool.name,
            input: JSON.stringify(mockCustomToolArgs),
          },
          mockFinishChunk,
        ] satisfies LanguageModelV2StreamPart[],
        chunkDelayInMs: 100,
        initialDelayInMs: 100,
      });

    const doStreamCalls = [
      () => makeCustomToolCallStream(),
      () => makeFinalAnswerStream(),
    ];

    it("should call custom tool and return after call (no final assistant message)", async () => {
      const generateResponse = makeGenerateResponseWithTools({
        ...makeGenerateResponseWithToolsArgs(),
        languageModel: makeMockLanguageModel(doStreamCalls),
      });

      const result = await generateResponse({
        ...generateResponseBaseArgs,
        toolDefinitions: [mockCustomTool],
      });

      expectSuccessfulResultCustomTool(result, {
        name: mockCustomTool.name,
        arguments: JSON.stringify(mockCustomToolArgs),
      });
    });

    it("should respect toolCall=auto option", async () => {
      const generateResponse = makeGenerateResponseWithTools({
        ...makeGenerateResponseWithToolsArgs(),
        languageModel: makeMockLanguageModel(doStreamCalls),
      });

      const result = await generateResponse({
        ...generateResponseBaseArgs,
        toolDefinitions: [mockCustomTool],
        toolChoice: "auto",
      });

      expectSuccessfulResultCustomTool(result, {
        name: "getAge",
        arguments: JSON.stringify(mockCustomToolArgs),
      });
    });

    it("should respect toolCall=functionName option", async () => {
      const generateResponse = makeGenerateResponseWithTools({
        ...makeGenerateResponseWithToolsArgs(),
        languageModel: makeMockLanguageModel(doStreamCalls),
      });

      const result = await generateResponse({
        ...generateResponseBaseArgs,
        toolDefinitions: [mockCustomTool],
        toolChoice: {
          type: "function",
          name: "getAge",
        },
      });

      expectSuccessfulResultCustomTool(result, {
        name: "getAge",
        arguments: JSON.stringify(mockCustomToolArgs),
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
  // User -> Assistant (fetch_page tool call) + fetch_page tool result ->
  // Assistant (search tool call) + search tool result -> Assistant msg (final answer)
  expect(result.messages).toHaveLength(6);

  expect(result.messages[0]).toMatchObject({
    role: "user",
    content: latestMessageText,
    customData: expect.objectContaining(searchToolMockArgs),
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

function expectSuccessfulResultCustomTool(
  result: GenerateResponseReturnValue,
  functionMessage: {
    name: string;
    arguments: string;
  }
) {
  // Should call the custom tool and stop (due to stopWhen condition)
  expect(result.messages).toHaveLength(2);
  expect(result.messages[0]).toMatchObject({
    role: "user",
    content: latestMessageText,
  });
  expect(result.messages[1]).toMatchObject({
    role: "assistant",
    toolCall: {
      id: "abc001",
      type: "function",
      function: functionMessage,
    },
  });
}
