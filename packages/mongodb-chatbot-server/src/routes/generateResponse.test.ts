import { ObjectId, References } from "mongodb-rag-core";
import {
  AwaitGenerateResponseParams,
  GenerateResponseParams,
  StreamGenerateResponseParams,
  awaitGenerateResponse,
  generateResponse,
  streamGenerateResponse,
} from "./generateResponse";
import {
  AssistantMessage,
  ChatLlm,
  Conversation,
  FunctionMessage,
  OpenAiChatMessage,
  ProcessingStreamEvent,
  makeDataStreamer,
} from "mongodb-rag-core";
import { strict as assert } from "assert";
import { createResponse } from "node-mocks-http";
import { Response as ExpressResponse } from "express";
import { EventEmitter } from "stream-json/Parser";

const testFuncName = "test_func";
const mockFunctionInvocation = {
  role: "assistant",
  content: "",
  functionCall: {
    arguments: JSON.stringify({ foo: "bar" }),
    name: testFuncName,
  },
} satisfies AssistantMessage;

const mockReject = "mock_reject";
const mockRejectFunctionInvocation = {
  role: "assistant",
  content: "",
  functionCall: {
    arguments: JSON.stringify({ fizz: "buzz" }),
    name: mockReject,
  },
} satisfies AssistantMessage;

const mockReferences: References = [
  { url: "https://example.com/ref", title: "Some title" },
];

const mockFunctionMessage = {
  name: testFuncName,
  role: "function",
  content: "bar",
} satisfies FunctionMessage satisfies OpenAiChatMessage;

const mockAssistantMessageContent = ["final ", "assistant ", "message"];
const mockAssistantMessage = {
  role: "assistant",
  content: mockAssistantMessageContent.join(""),
} satisfies AssistantMessage;

const mockLlmNotWorking = "llm_not_working";

const mockProcessingStreamEvent = {
  type: "processing",
  data: "Processing tool call",
} satisfies ProcessingStreamEvent;

const mockChatLlm: ChatLlm = {
  async answerQuestionAwaited({ messages }) {
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.content === testFuncName) {
      return mockFunctionInvocation;
    }
    if (latestMessage.content === mockReject) {
      return mockRejectFunctionInvocation;
    }
    if (latestMessage.content === mockLlmNotWorking) {
      throw new Error("LLM not working");
    }
    return mockAssistantMessage;
  },
  answerQuestionStream: async ({ messages }) =>
    (async function* () {
      let count = 0;
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.content === testFuncName) {
        yield {
          id: count.toString(), // Unique ID for each item
          created: new Date(),
          choices: [
            {
              index: 0,
              finishReason: "[STOP]",
              delta: {
                role: "assistant",
                content: "",
                toolCalls: [],
                functionCall: mockFunctionInvocation.functionCall,
              },
            },
          ],
          promptFilterResults: [],
        };
        return;
      }
      if (latestMessage.content === mockReject) {
        yield {
          id: count.toString(), // Unique ID for each item
          created: new Date(),
          choices: [
            {
              index: 0,
              finishReason: "[STOP]",
              delta: {
                role: "assistant",
                content: "",
                toolCalls: [],
                functionCall: mockRejectFunctionInvocation.functionCall,
              },
            },
          ],
          promptFilterResults: [],
        };
        return;
      }
      if (latestMessage.content === mockLlmNotWorking) {
        throw new Error("LLM not working");
      }
      while (count < mockAssistantMessageContent.length) {
        yield {
          id: count.toString(), // Unique ID for each item
          created: new Date(),
          choices: [
            {
              index: 0,
              finishReason: "[STOP]",
              delta: {
                role: "assistant",
                content: mockAssistantMessageContent[count],
                toolCalls: [],
              },
            },
          ],
          promptFilterResults: [],
        };
        count++;
      }
    })(),
  async callTool({ messages, dataStreamer }) {
    const latestMessage = messages[messages.length - 1] as AssistantMessage;
    assert(latestMessage.functionCall, "must be a function call");
    if (dataStreamer?.connected) {
      dataStreamer.streamData(mockProcessingStreamEvent);
    }
    if (latestMessage.functionCall.name === mockReject) {
      return {
        toolCallMessage: mockFunctionMessage,
        rejectUserQuery: true,
      };
    } else {
      return {
        toolCallMessage: mockFunctionMessage,
        references: mockReferences,
      };
    }
  },
};

const llmConversation: OpenAiChatMessage[] = [
  { role: "user", content: "hello" },
];
const references: References = [
  { url: "https://example.com", title: "Example" },
];
const reqId = "foo";
const llmNotWorkingMessage = "llm not working";
const noRelevantContentMessage = "no relevant content";
const conversation: Conversation = {
  _id: new ObjectId(),
  createdAt: new Date(),
  messages: [],
};
const dataStreamer = makeDataStreamer();

describe("generateResponse", () => {
  const baseArgs = {
    llm: mockChatLlm,
    llmConversation,
    references,
    reqId,
    llmNotWorkingMessage,
    noRelevantContentMessage,
    conversation,
    dataStreamer,
  } satisfies Omit<GenerateResponseParams, "shouldStream">;
  let res: ReturnType<typeof createResponse> & ExpressResponse;
  beforeEach(() => {
    res = createResponse({
      eventEmitter: EventEmitter,
    });
    dataStreamer.connect(res);
  });

  afterEach(() => {
    if (dataStreamer.connected) {
      dataStreamer?.disconnect();
    }
  });
  it("should stream response if shouldStream is true", async () => {
    await generateResponse({ ...baseArgs, shouldStream: true });
    const data = res._getData();

    for (let i = 0; i < 3; i++) {
      expect(data).toContain(
        `data: {"type":"delta","data":"${mockAssistantMessageContent[i]}"}`
      );
    }
    expect(data).toContain(
      `{"type":"references","data":${JSON.stringify(references)}}`
    );
  });
  it("should await response if shouldStream is false", async () => {
    await generateResponse({ ...baseArgs, shouldStream: false });
    const data = res._getData();
    expect(data).toBe("");
  });
});

describe("awaitGenerateResponse", () => {
  const baseArgs = {
    llm: mockChatLlm,
    llmConversation,
    references,
    reqId,
    llmNotWorkingMessage,
    noRelevantContentMessage,
    conversation,
  } satisfies AwaitGenerateResponseParams;
  it("should generate assistant response if no tools", async () => {
    const { messages } = await awaitGenerateResponse(baseArgs);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject(mockAssistantMessage);
  });
  it("should pass through references with final assistant message", async () => {
    const { messages } = await awaitGenerateResponse(baseArgs);
    expect(
      (messages[messages.length - 1] as AssistantMessage).references
    ).toMatchObject(references);
  });
  it("should call tool before responding", async () => {
    const { messages } = await awaitGenerateResponse({
      ...baseArgs,
      llmConversation: [{ role: "user", content: testFuncName }],
    });
    expect(messages).toHaveLength(3);
    expect(messages[messages.length - 2]).toMatchObject(mockFunctionMessage);
    expect(messages[messages.length - 1]).toMatchObject(mockAssistantMessage);
  });
  it("should pass references from a tool call", async () => {
    const { messages } = await awaitGenerateResponse({
      ...baseArgs,
      llmConversation: [{ role: "user", content: testFuncName }],
    });

    expect(messages).toHaveLength(3);
    expect(messages[messages.length - 2]).toMatchObject(mockFunctionMessage);
    expect(messages[messages.length - 1]).toMatchObject(mockAssistantMessage);
    expect(
      (messages[messages.length - 1] as AssistantMessage).references
    ).toMatchObject([...references, ...mockReferences]);
  });

  it("should reject input in a tool call", async () => {
    const { messages } = await awaitGenerateResponse({
      ...baseArgs,
      llmConversation: [
        {
          role: "user",
          content: mockReject,
        },
      ],
    });
    expect(messages[messages.length - 1]).toMatchObject({
      role: "assistant",
      content: noRelevantContentMessage,
    });
  });
  it("should only send vector search results and references if LLM not working", async () => {
    const { messages } = await awaitGenerateResponse({
      ...baseArgs,
      llmConversation: [
        {
          role: "user",
          content: mockLlmNotWorking,
        },
      ],
    });
    const finalMessage = messages[messages.length - 1] as AssistantMessage;
    expect(finalMessage).toMatchObject({
      role: "assistant",
      content: llmNotWorkingMessage,
    });
    expect(finalMessage.references?.length).toBeGreaterThanOrEqual(1);
  });
});

describe("streamGenerateResponse", () => {
  let res: ReturnType<typeof createResponse> & ExpressResponse;
  beforeEach(() => {
    res = createResponse({
      eventEmitter: EventEmitter,
    });
    dataStreamer.connect(res);
  });

  afterEach(() => {
    if (dataStreamer.connected) {
      dataStreamer?.disconnect();
    }
  });

  const baseArgs = {
    llm: mockChatLlm,
    llmConversation,
    references,
    reqId,
    llmNotWorkingMessage,
    noRelevantContentMessage,
    conversation,
    dataStreamer,
  } satisfies StreamGenerateResponseParams;

  it("should generate assistant response if no tools", async () => {
    const { messages } = await streamGenerateResponse(baseArgs);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject(mockAssistantMessage);
    const data = res._getData();
    for (let i = 0; i < 3; i++) {
      expect(data).toContain(
        `data: {"type":"delta","data":"${mockAssistantMessageContent[i]}"}`
      );
    }
  });
  it("should pass through references with final assistant message", async () => {
    const { messages } = await streamGenerateResponse(baseArgs);
    expect(
      (messages[messages.length - 1] as AssistantMessage).references
    ).toMatchObject(references);
    const data = res._getData();
    expect(data).toContain(
      `data: {"type":"references","data":${JSON.stringify(references)}}`
    );
  });
  it("should call tool before responding", async () => {
    const { messages } = await streamGenerateResponse({
      ...baseArgs,
      llmConversation: [{ role: "user", content: testFuncName }],
    });
    expect(messages).toHaveLength(3);
    expect(messages[messages.length - 2]).toMatchObject(mockFunctionMessage);
    expect(messages[messages.length - 1]).toMatchObject(mockAssistantMessage);
    const data = res._getData();
    expect(data).toContain(
      `data: {"type":"processing","data":"${mockProcessingStreamEvent.data}"}`
    );
    for (let i = 0; i < 3; i++) {
      expect(data).toContain(
        `data: {"type":"delta","data":"${mockAssistantMessageContent[i]}"}`
      );
    }
    expect(data).toContain(
      `{"type":"references","data":${JSON.stringify(
        references.concat(mockReferences)
      )}}`
    );
  });
  it("should pass references from a tool call", async () => {
    const { messages } = await streamGenerateResponse({
      ...baseArgs,
      llmConversation: [{ role: "user", content: testFuncName }],
    });

    expect(messages).toHaveLength(3);
    expect(messages[messages.length - 2]).toMatchObject(mockFunctionMessage);
    expect(messages[messages.length - 1]).toMatchObject(mockAssistantMessage);
    expect(
      (messages[messages.length - 1] as AssistantMessage).references
    ).toMatchObject([...references, ...mockReferences]);
    const data = res._getData();
    expect(data).toContain(
      `{"type":"references","data":${JSON.stringify(
        references.concat(mockReferences)
      )}}`
    );
  });

  it("should reject input in a tool call", async () => {
    const { messages } = await streamGenerateResponse({
      ...baseArgs,
      llmConversation: [
        {
          role: "user",
          content: mockReject,
        },
      ],
    });
    expect(messages[messages.length - 1]).toMatchObject({
      role: "assistant",
      content: noRelevantContentMessage,
    });
    const data = res._getData();
    expect(data).toContain(
      `data: {"type":"processing","data":"${mockProcessingStreamEvent.data}"}`
    );
    expect(data).toContain(
      `data: {"type":"delta","data":"${noRelevantContentMessage}"}`
    );
    expect(data).toContain(
      `data: {"type":"references","data":${JSON.stringify(references)}}`
    );
  });
  it("should only send vector search results and references if LLM not working", async () => {
    const { messages } = await streamGenerateResponse({
      ...baseArgs,
      llmConversation: [
        {
          role: "user",
          content: mockLlmNotWorking,
        },
      ],
    });
    const finalMessage = messages[messages.length - 1] as AssistantMessage;
    expect(finalMessage).toMatchObject({
      role: "assistant",
      content: llmNotWorkingMessage,
    });
    expect(finalMessage.references?.length).toBeGreaterThanOrEqual(1);

    const data = res._getData();
    expect(data).toContain(
      `data: {"type":"delta","data":"${llmNotWorkingMessage}"}`
    );
    expect(data).toContain(
      `data: {"type":"references","data":${JSON.stringify(references)}}`
    );
  });
});
