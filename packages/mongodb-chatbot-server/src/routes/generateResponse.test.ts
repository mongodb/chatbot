import { ObjectId, References } from "mongodb-rag-core";
import {
  AwaitGenerateResponseParams,
  StreamGenerateResponseParams,
  awaitGenerateResponse,
  streamGenerateResponse,
} from "./generateResponse";
import {
  AssistantMessage,
  ChatLlm,
  Conversation,
  FunctionMessage,
  OpenAiChatMessage,
  makeDataStreamer,
} from "../services";
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
} satisfies FunctionMessage;

const mockAssistantMessage = {
  role: "assistant",
  content: "final assistant message",
} satisfies AssistantMessage;

const mockLlmNotWorking = "llm_not_working";

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
        // TODO: i'm not sure if this is the right
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
                // TODO: mock this...
                toolCalls: [],
              },
            },
          ],
          promptFilterResults: [],
        };
        return;
      }
      if (latestMessage.content === mockReject) {
        // TODO: what's supposed to happen here?
        return mockRejectFunctionInvocation;
      }
      if (latestMessage.content === mockLlmNotWorking) {
        throw new Error("LLM not working");
      }
      while (count < 5) {
        yield {
          id: count.toString(), // Unique ID for each item
          created: new Date(),
          choices: [
            {
              index: 0,
              finishReason: "[STOP]",
              delta: {
                role: "assistant",
                content: `Example content ${count}\n`, // Example content
                toolCalls: [],
              },
            },
          ],
          promptFilterResults: [],
        };
        count++;
      }
    })(),

  async callTool({ messages }) {
    const latestMessage = messages[messages.length - 1] as AssistantMessage;
    assert(latestMessage.functionCall, "must be a function call");
    if (latestMessage.functionCall.name === mockReject) {
      return {
        functionMessage: mockFunctionMessage,
        rejectUserQuery: true,
      };
    } else {
      return {
        functionMessage: mockFunctionMessage,
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

describe("generateResponse", () => {
  it("should stream response if shouldStream is true", async () => {
    // TODO: implement this
  });
  it("should await response if shouldStream is false", async () => {
    // TODO: implement this
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
  it("should only send vector search results + references if LLM not working", async () => {
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
  const dataStreamer = makeDataStreamer();
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
    // TODO: track the stream in the res obj
    expect(messages).toHaveLength(1);
    expect(messages[0]).toMatchObject(mockAssistantMessage);
  });
  it("should pass through references with final assistant message", async () => {
    const { messages } = await streamGenerateResponse(baseArgs);
    expect(
      (messages[messages.length - 1] as AssistantMessage).references
    ).toMatchObject(references);
  });
  it("should call tool before responding", async () => {
    const { messages } = await streamGenerateResponse({
      ...baseArgs,
      llmConversation: [{ role: "user", content: testFuncName }],
    });
    expect(messages).toHaveLength(3);
    expect(messages[messages.length - 2]).toMatchObject(mockFunctionMessage);
    expect(messages[messages.length - 1]).toMatchObject(mockAssistantMessage);
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
  });
  it("should only send vector search results + references if LLM not working", async () => {
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
  });
});
