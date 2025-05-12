import { jest } from "@jest/globals";
import { makeGenerateResponseWithSearchTool } from "./generateResponseWithSearchTool";
import {
  AssistantMessage,
  References,
  SystemMessage,
  ToolMessage,
  UserMessage,
} from "mongodb-rag-core";
import {
  CoreMessage,
  LanguageModel,
  StepResult,
  TextStreamPart,
  tool,
  ToolChoice,
  ToolSet,
} from "mongodb-rag-core/aiSdk";

// Mock dependencies
jest.mock("mongodb-rag-core/aiSdk", () => {
  const originalModule = jest.requireActual("mongodb-rag-core/aiSdk");
  return {
    ...originalModule,
    generateText: jest.fn(),
    streamText: jest.fn(),
  };
});

import { generateText, streamText } from "mongodb-rag-core/aiSdk";

describe("generateResponseWithSearchTool", () => {
  // Mock setup
  const mockLanguageModel: LanguageModel = {
    id: "test-model",
    provider: "test-provider",
  };

  const mockSystemMessage: SystemMessage = {
    role: "system",
    content: "You are a helpful assistant.",
  };

  const mockSearchTool = tool({
    name: "search_content",
    parameters: { query: { type: "string" } },
    async execute(args) {
      return {
        content: [
          {
            url: "https://example.com",
            text: "Example content",
            metadata: { pageTitle: "Example Page" },
          },
        ],
      };
    },
  });

  const mockFilterPreviousMessages = jest.fn().mockResolvedValue([]);

  const mockLlmNotWorkingMessage =
    "Sorry, I am having trouble with the language model.";

  const mockDataStreamer = {
    streamData: jest.fn(),
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("makeGenerateResponseWithSearchTool", () => {
    test("should return a function", () => {
      const generateResponse = makeGenerateResponseWithSearchTool({
        languageModel: mockLanguageModel,
        llmNotWorkingMessage: mockLlmNotWorkingMessage,
        systemMessage: mockSystemMessage,
        searchTool: mockSearchTool,
        filterPreviousMessages: mockFilterPreviousMessages,
      });

      expect(typeof generateResponse).toBe("function");
    });

    describe("non-streaming mode", () => {
      test("should handle successful generation", async () => {
        // Mock generateText to return a successful result
        (generateText as jest.Mock).mockResolvedValueOnce({
          text: "This is a response",
          stepResults: [],
        });

        const generateResponse = makeGenerateResponseWithSearchTool({
          languageModel: mockLanguageModel,
          llmNotWorkingMessage: mockLlmNotWorkingMessage,
          systemMessage: mockSystemMessage,
          searchTool: mockSearchTool,
          filterPreviousMessages: mockFilterPreviousMessages,
        });

        const result = await generateResponse({
          conversation: { messages: [] },
          latestMessageText: "Hello",
          shouldStream: false,
        });

        expect(result).toHaveProperty("messages");
        expect(result.messages).toHaveLength(2); // User + assistant
        expect(result.messages[0].role).toBe("user");
        expect(result.messages[1].role).toBe("assistant");
      });

      test("should handle guardrail rejection", async () => {
        const mockGuardrail = jest.fn().mockResolvedValue({
          rejected: true,
          message: "Content policy violation",
          metadata: { reason: "inappropriate" },
        });

        const generateResponse = makeGenerateResponseWithSearchTool({
          languageModel: mockLanguageModel,
          llmNotWorkingMessage: mockLlmNotWorkingMessage,
          systemMessage: mockSystemMessage,
          searchTool: mockSearchTool,
          filterPreviousMessages: mockFilterPreviousMessages,
          inputGuardrail: mockGuardrail,
        });

        const result = await generateResponse({
          conversation: { messages: [] },
          latestMessageText: "Bad question",
          shouldStream: false,
        });

        expect(result.messages[1].role).toBe("assistant");
        expect(result.messages[1].content).toBe("Content policy violation");
        expect(result.messages[1].metadata).toEqual({
          reason: "inappropriate",
        });
      });

      test("should handle error in language model", async () => {
        (generateText as jest.Mock).mockRejectedValueOnce(
          new Error("LLM error")
        );

        const generateResponse = makeGenerateResponseWithSearchTool({
          languageModel: mockLanguageModel,
          llmNotWorkingMessage: mockLlmNotWorkingMessage,
          systemMessage: mockSystemMessage,
          searchTool: mockSearchTool,
          filterPreviousMessages: mockFilterPreviousMessages,
        });

        const result = await generateResponse({
          conversation: { messages: [] },
          latestMessageText: "Hello",
          shouldStream: false,
        });

        expect(result.messages[0].role).toBe("assistant");
        expect(result.messages[0].content).toBe(mockLlmNotWorkingMessage);
      });
    });

    describe("streaming mode", () => {
      test("should handle successful streaming", async () => {
        // Mock the async generator
        const mockStream = (async function* () {
          yield { type: "text-delta", textDelta: "Hello" };
          yield { type: "text-delta", textDelta: " world" };
          // Tool result
          yield {
            type: "tool-result",
            toolName: "search_content",
            result: {
              content: [
                {
                  url: "https://example.com",
                  metadata: { pageTitle: "Test" },
                },
              ],
            },
          };
        })();

        (streamText as jest.Mock).mockReturnValueOnce({
          fullStream: mockStream,
          text: Promise.resolve("Hello world"),
          steps: Promise.resolve([{ text: "Hello world", toolResults: [] }]),
        });

        const generateResponse = makeGenerateResponseWithSearchTool({
          languageModel: mockLanguageModel,
          llmNotWorkingMessage: mockLlmNotWorkingMessage,
          systemMessage: mockSystemMessage,
          searchTool: mockSearchTool,
          filterPreviousMessages: mockFilterPreviousMessages,
        });

        const result = await generateResponse({
          conversation: { messages: [] },
          latestMessageText: "Hello",
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(mockDataStreamer.streamData).toHaveBeenCalledTimes(3);
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          data: "Hello",
          type: "delta",
        });
        expect(mockDataStreamer.streamData).toHaveBeenCalledWith({
          data: expect.arrayContaining([
            expect.objectContaining({ url: "https://example.com" }),
          ]),
          type: "references",
        });
        expect(result.messages).toHaveLength(2); // User + assistant
      });

      test("should handle streaming with guardrail rejection", async () => {
        const mockGuardrail = jest.fn().mockResolvedValue({
          rejected: true,
          message: "Content policy violation",
          metadata: { reason: "inappropriate" },
        });

        const generateResponse = makeGenerateResponseWithSearchTool({
          languageModel: mockLanguageModel,
          llmNotWorkingMessage: mockLlmNotWorkingMessage,
          systemMessage: mockSystemMessage,
          searchTool: mockSearchTool,
          filterPreviousMessages: mockFilterPreviousMessages,
          inputGuardrail: mockGuardrail,
        });

        const result = await generateResponse({
          conversation: { messages: [] },
          latestMessageText: "Bad question",
          shouldStream: true,
          dataStreamer: mockDataStreamer,
        });

        expect(result.messages[1].role).toBe("assistant");
        expect(result.messages[1].content).toBe("Content policy violation");
      });
    });
  });

  describe("helper functions", () => {
    // Test the stepResultsToMessages function
    test("stepResultsToMessages should convert step results to messages", () => {
      // Import the function explicitly for testing
      const { stepResultsToMessages } = jest.requireActual(
        "./generateResponseWithSearchTool"
      );

      const mockStepResults: StepResult<any>[] = [
        {
          text: "Test response",
          toolCalls: [
            {
              toolCallId: "call-1",
              toolName: "search_content",
              args: { query: "test" },
            },
          ],
        },
        {
          text: "",
          toolResults: [
            {
              toolName: "search_content",
              toolCallId: "call-1",
              result: { content: [] },
            },
          ],
        },
      ];

      const messages = stepResultsToMessages(mockStepResults, []);

      expect(messages).toHaveLength(3); // 1 assistant + 1 tool call + 1 tool result
      expect(messages[0].role).toBe("assistant");
      expect(messages[1].role).toBe("assistant");
      expect(messages[1].toolCall).toBeDefined();
      expect(messages[2].role).toBe("tool");
    });

    // Test convertConversationMessageToLlmMessage
    test("convertConversationMessageToLlmMessage should convert different message types", () => {
      // Import the function explicitly for testing
      const { convertConversationMessageToLlmMessage } = jest.requireActual(
        "./generateResponseWithSearchTool"
      );

      const userMessage: UserMessage = {
        role: "user",
        content: "Hello",
      };

      const assistantMessage: AssistantMessage = {
        role: "assistant",
        content: "Hi there",
        toolCall: {
          type: "function",
          id: "call-1",
          function: { name: "test", arguments: "{}" },
        },
      };

      const systemMessage: SystemMessage = {
        role: "system",
        content: "You are helpful",
      };

      const toolMessage: ToolMessage = {
        role: "tool",
        name: "search_content",
        content: '{"results": []}',
      };

      expect(convertConversationMessageToLlmMessage(userMessage).role).toBe(
        "user"
      );
      expect(
        convertConversationMessageToLlmMessage(assistantMessage).role
      ).toBe("assistant");
      expect(convertConversationMessageToLlmMessage(systemMessage).role).toBe(
        "system"
      );

      const convertedToolMessage =
        convertConversationMessageToLlmMessage(toolMessage);
      expect(convertedToolMessage.role).toBe("tool");
      expect(Array.isArray(convertedToolMessage.content)).toBe(true);
    });
  });
});
