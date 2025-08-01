import "dotenv/config";
import type { Server } from "http";
import type { Express } from "express";
import type { ConversationsService, SomeMessage } from "mongodb-rag-core";
import {
  type OpenAIProvider,
  createOpenAI,
  streamText,
  generateText,
} from "mongodb-rag-core/aiSdk";
import {
  CreateResponseRequest,
  CREATE_RESPONSE_ERR_MSG,
} from "mongodb-chatbot-server";
import { OpenAI } from "mongodb-rag-core/openai";
import { makeTestApp } from "./test/testHelpers";
import { Logger, makeBraintrustLogger } from "mongodb-rag-core/braintrust";

jest.setTimeout(100 * 1000); // 100 seconds

const TEST_OPENAI_API_KEY = "test-api-key";
const TEST_PORT = 5200;
const TEST_ORIGIN = `http://localhost:${TEST_PORT}`;
const API_PREFIX = "/api/v1";
const MONGO_CHAT_MODEL = "mongodb-chat-latest";

// Response event types
const DELTA_EVENT = "response.output_text.delta";
const DONE_EVENT = "response.output_text.done";

describe("Responses API with OpenAI Client", () => {
  let app: Express;
  let server: Server;
  let ipAddress: string;
  let origin: string;
  let conversations: ConversationsService;
  let openAiClient: OpenAI;
  let aiSDKClient: OpenAIProvider;

  beforeAll(async () => {
    const testAppResult = await makeTestApp();
    app = testAppResult.app;
    conversations = testAppResult.conversations;
    ipAddress = testAppResult.ipAddress;
    origin = TEST_ORIGIN;

    server = app.listen(TEST_PORT);

    openAiClient = new OpenAI({
      baseURL: origin + API_PREFIX,
      apiKey: TEST_OPENAI_API_KEY,
      defaultHeaders: {
        Origin: origin,
        "X-Forwarded-For": ipAddress,
      },
    });
    aiSDKClient = createOpenAI({
      baseURL: origin + API_PREFIX,
      apiKey: TEST_OPENAI_API_KEY,
      headers: {
        Origin: origin,
        "X-Forwarded-For": ipAddress,
      },
    });
  });

  afterAll(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
  });

  const createResponseRequestStream = async (
    body?: Parameters<typeof openAiClient.responses.create>[0]
  ) => {
    return await openAiClient.responses.create({
      model: MONGO_CHAT_MODEL,
      input: "What is MongoDB?",
      stream: true,
      temperature: 0,
      ...body,
    });
  };

  const sampleTool = {
    type: "function",
    strict: true,
    name: "test-tool",
    description: "A tool for testing.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  } as const;

  describe("Valid requests", () => {
    it("Should return responses given a string input", async () => {
      const stream = await createResponseRequestStream();

      await expectValidResponses({ stream });
    });

    it("Should return responses given a message array input", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        input: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is MongoDB?" },
          {
            role: "assistant",
            content: [
              {
                type: "output_text",
                text: "MongoDB is a document database.",
                annotations: [],
              },
            ],
          },
          { role: "user", content: "What is a document database?" },
        ],
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses given a message array with input_text content type", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        input: [
          {
            role: "user",
            content: [{ type: "input_text", text: "What is MongoDB?" }],
          },
        ],
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses given a valid request with instructions", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        instructions: "You are a helpful chatbot.",
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with valid max_output_tokens", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        max_output_tokens: 4000,
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with valid metadata", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        metadata: { key1: "value1", key2: "value2" },
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with previous_response_id", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const conversation = await conversations.create({ initialMessages });

      const previous_response_id = conversation.messages.at(-1)?.id?.toString();
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        previous_response_id,
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with user", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        user: "some-user-id",
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with store=false", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: false,
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with store=true", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: true,
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });

    it("Should return responses with tools and tool_choice=auto", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        tools: [
          {
            type: "function",
            strict: true,
            name: "test-tool",
            description: "A tool for testing.",
            parameters: {
              type: "object",
              properties: {
                query: { type: "string" },
              },
              required: ["query"],
            },
          },
        ],
        tool_choice: "auto",
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });
    // Skipping this test for the CI as it requires a real OpenAI client, which we don't do in the CI environment
    it.skip("Should return correct tool choice for tool_choice=someTool", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        tools: [sampleTool],
        tool_choice: {
          type: "function",
          name: sampleTool.name,
        },
      };
      const stream = await createResponseRequestStream(requestBody);

      // Collect all responses
      const responses: any[] = [];
      for await (const event of stream) {
        responses.push(event);
      }

      // Find function call events
      const functionCallEvents = responses.filter(
        (r) =>
          r.type === "response.function_call_arguments.delta" ||
          r.type === "response.function_call_arguments.done"
      );

      // Verify that the specific tool was called
      expect(functionCallEvents.length).toBeGreaterThan(0);

      // Check that the function call arguments done event contains the correct tool name
      const functionCallDoneEvent = responses.find(
        (r) => r.type === "response.function_call_arguments.done"
      );
      expect(functionCallDoneEvent).toBeDefined();

      // Verify the tool name matches our sample tool
      const outputItemEvents = responses.filter(
        (r) =>
          r.type === "response.output_item.added" &&
          r.item?.type === "function_call"
      );
      expect(outputItemEvents.length).toBeGreaterThan(0);
      expect(outputItemEvents[0].item.name).toBe(sampleTool.name);
    });
  });

  describe("Invalid requests", () => {
    it("Should return error responses if empty input string", async () => {
      const stream = createResponseRequestStream({
        input: "",
      });

      await expectInvalidResponses({
        stream,
        errorMessage: CREATE_RESPONSE_ERR_MSG.INPUT_LENGTH,
      });
    });

    it("Should return error responses if empty message array", async () => {
      const stream = createResponseRequestStream({
        // @ts-expect-error - empty array is valid input
        input: [],
      });

      await expectInvalidResponses({
        stream,
        errorMessage: CREATE_RESPONSE_ERR_MSG.INPUT_ARRAY,
      });
    });

    it("Should return error responses if model is not supported", async () => {
      const invalidModel = "invalid-model";
      const stream = createResponseRequestStream({
        model: invalidModel,
      });

      await expectInvalidResponses({
        stream,
        errorMessage: CREATE_RESPONSE_ERR_MSG.MODEL_NOT_SUPPORTED(invalidModel),
      });
    });

    it("Should return error responses if max_output_tokens is > allowed limit", async () => {
      const max_output_tokens = 4001;
      const stream = createResponseRequestStream({
        max_output_tokens,
      });

      await expectInvalidResponses({
        stream,
        errorMessage: CREATE_RESPONSE_ERR_MSG.MAX_OUTPUT_TOKENS(
          max_output_tokens,
          4000
        ),
      });
    });

    it("Should return error responses if temperature is not 0", async () => {
      const stream = createResponseRequestStream({
        temperature: 0.5 as any,
      });

      await expectInvalidResponses({
        stream,
        errorMessage: "Path: body.temperature - Temperature must be 0",
      });
    });

    it("Should return error responses if stream is false", async () => {
      // Handles error slightly differently when stream: false
      await expect(
        openAiClient.responses.create({
          model: MONGO_CHAT_MODEL,
          input: "What is MongoDB?",
          stream: false,
          temperature: 0,
        })
      ).rejects.toThrow(/Path: body.stream - 'stream' must be true/);
    });
  });

  describe("Real OpenAI integration", () => {
    it("Should handle actual conversation flow", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Hello, can you tell me about MongoDB?" },
      ];
      const conversation = await conversations.create({ initialMessages });

      const previous_response_id = conversation.messages.at(-1)?.id.toString();
      const stream = await createResponseRequestStream({
        previous_response_id,
        input: "Tell me more about MongoDB Atlas",
      });

      const responses = await expectValidResponses({ stream });

      const events = responses.map((r) => r.type);
      expect(events).toContain(DELTA_EVENT);
      expect(events).toContain(DONE_EVENT);

      const deltaCount = events.filter((t) => t === DELTA_EVENT).length;
      const doneCount = events.filter((t) => t === DONE_EVENT).length;

      // 3 lifecycle events are validated in the expectValidResponses function above
      expect(responses.length).toBeGreaterThanOrEqual(5);
      expect(deltaCount).toBeGreaterThanOrEqual(1);
      expect(doneCount).toBe(1);
    });

    it("Should handle concurrent requests", async () => {
      const [stream1, stream2] = await Promise.all([
        createResponseRequestStream({
          input: "What is MongoDB?",
        }),
        createResponseRequestStream({
          input: "What is MongoDB Atlas?",
        }),
      ]);

      const [responses1, responses2] = await Promise.all([
        expectValidResponses({ stream: stream1 }),
        expectValidResponses({ stream: stream2 }),
      ]);

      const events1 = responses1.map((r) => r.type);
      const events2 = responses2.map((r) => r.type);

      expect(events1).toContain(DELTA_EVENT);
      expect(events1).toContain(DONE_EVENT);

      expect(events2).toContain(DELTA_EVENT);
      expect(events2).toContain(DONE_EVENT);

      const deltaCount1 = events1.filter((t) => t === DELTA_EVENT).length;
      const doneCount1 = events1.filter((t) => t === DONE_EVENT).length;

      // 3 lifecycle events are validated in the expectValidResponses function above
      expect(responses1.length).toBeGreaterThanOrEqual(5);
      expect(deltaCount1).toBeGreaterThanOrEqual(1);
      expect(doneCount1).toBe(1);

      const deltaCount2 = events2.filter((t) => t === DELTA_EVENT).length;
      const doneCount2 = events2.filter((t) => t === DONE_EVENT).length;

      // 3 lifecycle events are validated in the expectValidResponses function above
      expect(responses2.length).toBeGreaterThanOrEqual(5);
      expect(deltaCount2).toBeGreaterThanOrEqual(1);
      expect(doneCount2).toBe(1);
    });
  });

  describe("Real AI SDK integration", () => {
    it("Should handle basic text streaming", async () => {
      const result = await streamText({
        model: aiSDKClient.responses(MONGO_CHAT_MODEL),
        prompt: [
          {
            role: "assistant",
            content: [{ type: "text", text: "Here's some test context..." }],
          },
          {
            role: "user",
            content: [{ type: "text", text: "What is MongoDB?" }],
          },
        ],
      });

      const events: any[] = [];
      for await (const chunk of result.toUIMessageStream()) {
        events.push(chunk);
      }

      const resultText = await result.text;
      const eventTypes = events.map((e) => e.type);

      expect(eventTypes).toContain("start");
      expect(eventTypes).toContain("start-step");
      expect(eventTypes).toContain("text-start");
      expect(eventTypes).toContain("text-delta");
      expect(eventTypes).toContain("text-end");
      expect(eventTypes).toContain("finish");

      expect(resultText).toContain("MongoDB");
      expect(resultText).toContain("document");
      expect(resultText).toContain("database");
    });

    it("Should throw an error when generating text since we don't support non-streaming generation", async () => {
      try {
        await generateText({
          model: aiSDKClient.responses(MONGO_CHAT_MODEL),
          prompt: "What is MongoDB?",
        });

        fail("Expected request to throw an error but it didn't");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        // currently throws "Invalid JSON response" instead of the zod error: "Path: body.stream - 'stream' must be true"
        // this will require quite a bit of changing how the input validation works to enable this to work for ai sdk clients
        expect((error as Error).message).toContain("Invalid JSON response");
      }
    });
  });

  // Skipping these tests because they require manual validation
  // in the Braintrust UI. There isn't presently a good way to
  // validate the tracing data in the tests.
  describe.skip("Braintrust tracing", () => {
    let logger: Logger<true>;
    beforeAll(async () => {
      logger = makeBraintrustLogger({
        apiKey: process.env.BRAINTRUST_TRACING_API_KEY,
        projectName: process.env.BRAINTRUST_CHATBOT_TRACING_PROJECT_NAME,
      });
      await logger.flush();
    });

    it("Should return responses with tracing", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: true,
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });
    it("should return responses without tracing", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: false,
      };
      const stream = await createResponseRequestStream(requestBody);

      await expectValidResponses({ stream, requestBody });
    });
  });
});

interface ExpectValidResponsesArgs {
  stream: any;
  requestBody?: Partial<CreateResponseRequest["body"]>;
}

const expectValidResponses = async ({
  stream,
  requestBody = {},
}: ExpectValidResponsesArgs) => {
  const responses: any[] = [];
  for await (const event of stream) {
    responses.push(event);
  }

  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBeGreaterThan(0);

  const responseTypes = responses.map((r) => r.type);
  expect(responseTypes).toContain("response.created");
  expect(responseTypes).toContain("response.in_progress");
  expect(responseTypes).toContain("response.completed");

  responses.forEach(({ response }) => {
    if (response) {
      expect(typeof response.id).toBe("string");
      expect(typeof response.created_at).toBe("number");
      expect(response.object).toBe("response");
      expect(response.error).toBeNull();
      expect(response.model).toBe(MONGO_CHAT_MODEL);
      expect(response.stream).toBe(true);
      expect(response.temperature).toBe(0);

      if (requestBody.instructions) {
        expect(response.instructions).toBe(requestBody.instructions);
      }
      if (requestBody.max_output_tokens) {
        expect(response.max_output_tokens).toBe(requestBody.max_output_tokens);
      }
      if (requestBody.metadata) {
        expect(response.metadata).toEqual(requestBody.metadata);
      }
    }
  });

  return responses;
};

interface ExpectInvalidResponsesArgs {
  stream: Promise<AsyncIterable<any>>;
  errorMessage: string;
}

async function expectInvalidResponses(args: ExpectInvalidResponsesArgs) {
  try {
    const stream = await args.stream;
    for await (const _ of stream) {
      // iterate until gets to error
      continue;
    }
    fail("Expected request to throw an error but it didn't");
  } catch (error: any) {
    expect(error).toBeInstanceOf(Error);
    const errorMessage = error.message ?? error.toString();
    expect(errorMessage).toContain(args.errorMessage);
  }
}
