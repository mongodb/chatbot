import { jest } from "@jest/globals";
import {
  makeGenerateResponseWithSearchTool,
  SearchToolReturnValue,
} from "./generateResponseWithSearchTool";
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
import { z } from "zod";
import {
  generateText,
  streamText,
  ToolExecutionOptions,
} from "mongodb-rag-core/aiSdk";

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

  const mockSearchToolParameters = z.object({
    query: z.string(),
  });

  const mockSearchTool = tool({
    description: "Test search tool",
    parameters: mockSearchToolParameters,
    async execute(
      { query }: { query: string },
      _options?: ToolExecutionOptions
    ): Promise<SearchToolReturnValue> {
      return {
        content: [
          {
            url: "https://example.com",
            text: `Content for query: ${query}`,
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
    it("should filter previous messages", async () => {
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
    });

    it("should make reference links", async () => {
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
    });

    describe("non-streaming", () => {
      test("should handle successful generation non-streaming", async () => {
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
      test("should handle successful generation with guardrail", async () => {
        // TODO: add
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

      test("should handle error in language model", async () => {
        // TODO: add
      });
    });
  });
});
