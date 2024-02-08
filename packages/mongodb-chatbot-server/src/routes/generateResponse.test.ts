import { ObjectId, References } from "mongodb-rag-core";
import {
  AwaitGenerateResponseParams,
  awaitGenerateResponse,
} from "./generateResponse";
import {
  AssistantMessage,
  ChatLlm,
  Conversation,
  FunctionMessage,
  OpenAiChatMessage,
} from "../services";

export const testFuncName = "test_func";

export const mockFunctionInvocation = {
  role: "assistant",
  content: "",
  functionCall: {
    arguments: JSON.stringify({ foo: "bar" }),
    name: testFuncName,
  },
} satisfies AssistantMessage;

export const mockReferences: References = [
  { url: "https://example.com/ref", title: "Some title" },
];

export const mockFunctionMessage = {
  name: testFuncName,
  role: "function",
  content: "bar",
} satisfies FunctionMessage;

export const mockAssistantMessage = {
  role: "assistant",
  content: "foo",
} satisfies AssistantMessage;

export const mockChatLlm: ChatLlm = {
  async answerQuestionAwaited({ messages, toolCallOptions }) {
    if (
      (typeof toolCallOptions === "object" &&
        toolCallOptions.name === testFuncName) ||
      // trigger calling function message from message
      messages[messages.length - 1]?.content === testFuncName
    ) {
      return mockFunctionInvocation;
    }
    return mockAssistantMessage;
  },
  answerQuestionStream: async () =>
    (async function* () {
      let count = 0;
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

  async callTool() {
    return {
      functionMessage: mockFunctionMessage,
      references: mockReferences,
    };
  },
};
const llmConversation: OpenAiChatMessage[] = [];
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
    expect(messages[0].role).toBe("assistant");
    expect(typeof messages[0].content).toBe("string");
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
    expect(messages).toMatchObject([
      mockFunctionInvocation,
      mockFunctionMessage,
      mockAssistantMessage,
    ]);
  });
  it("should pass references from a tool call", async () => {
    const { messages } = await awaitGenerateResponse({
      ...baseArgs,
      llmConversation: [{ role: "user", content: testFuncName }],
    });
    expect(
      (messages[messages.length - 1] as AssistantMessage).references
    ).toMatchObject(mockReferences);
  });
  it("should call multiple tools before responding", async () => {
    // TODO: update base args
    const { messages } = await awaitGenerateResponse(baseArgs);
    expect(
      messages.reduce((acc, m) => {
        if (m.role === "function") {
          return acc + 1;
        }
        return acc;
      }, 0)
    ).toBeGreaterThanOrEqual(2);
  });
  it("should have a tool direct subsequent LLM call", async () => {
    // TODO...not quite sure how to test
  });
  it("should reject input in a tool call", async () => {
    // TODO: update base args
    const { messages } = await awaitGenerateResponse(baseArgs);
    expect(messages[messages.length - 1].content).toBe(
      noRelevantContentMessage
    );
  });
  it("should only send vector search results + references if LLM not working", async () => {
    // TODO: update base args
    const { messages } = await awaitGenerateResponse(baseArgs);
    const finalMessage = messages[messages.length - 1] as AssistantMessage;
    expect(finalMessage.content).toBe(llmNotWorkingMessage);
    expect(finalMessage.references?.length).toBeGreaterThanOrEqual(1);
  });
});
