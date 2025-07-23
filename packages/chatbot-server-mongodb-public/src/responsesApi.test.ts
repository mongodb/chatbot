import "dotenv/config";
import type { Server } from "http";
import { OpenAI } from "mongodb-rag-core/openai";
import type { ConversationsService, SomeMessage } from "mongodb-rag-core";
import type { CreateResponseRequest } from "mongodb-chatbot-server/src/routes/responses/createResponse";
import { makeTestApp } from "./test/testHelpers";

jest.setTimeout(100000);

const TEST_OPENAI_API_KEY = "test-api-key";
const TEST_PORT = 5200;
const TEST_ORIGIN = `http://localhost:${TEST_PORT}`;
const API_PREFIX = "/api/v1";

describe("Responses API with OpenAI Client", () => {
  let app: any;
  let server: Server;
  let ipAddress: string;
  let origin: string;
  let conversations: ConversationsService;
  let openAiClient: OpenAI;

  beforeAll(async () => {
    // Create test app using existing test helpers
    const testAppResult = await makeTestApp();
    app = testAppResult.app;
    conversations = testAppResult.conversations;
    ipAddress = testAppResult.ipAddress;
    origin = TEST_ORIGIN;

    // Start the server
    server = app.listen(TEST_PORT);

    // Create OpenAI client that points to our test server
    openAiClient = new OpenAI({
      baseURL: origin + API_PREFIX,
      apiKey: TEST_OPENAI_API_KEY,
      defaultHeaders: {
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
    body?: Omit<Partial<CreateResponseRequest["body"]>, "stream">
  ) => {
    return await openAiClient.responses.create({
      model: "mongodb-chat-latest",
      input: "What is MongoDB?",
      stream: true,
      temperature: 0,
      ...body,
    });
  };

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
          { role: "assistant", content: "MongoDB is a document database." },
          { role: "user", content: "What is a document database?" },
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
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages.at(-1)?.id.toString();
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

    it("Should return responses with tools and tool_choice", async () => {
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
  });

  describe("Invalid requests", () => {
    it("Should return error responses if empty input string", async () => {
      const stream = await createResponseRequestStream({
        input: "",
      });

      await expectInvalidResponses({
        stream,
        error: {
          type: "invalid_request_error",
          code: "invalid_request_error",
          message: "Path: body.input - Input must be a non-empty string",
        },
      });
    });

    it("Should return error responses if empty message array", async () => {
      const stream = await createResponseRequestStream({
        input: [],
      });

      await expectInvalidResponses({
        stream,
        error: {
          type: "invalid_request_error",
          code: "invalid_request_error",
          message:
            "Path: body.input - Input must be a string or array of messages. See https://platform.openai.com/docs/api-reference/responses/create#responses-create-input for more information.",
        },
      });
    });

    it("Should return error responses if model is not supported", async () => {
      const invalidModel = "invalid-model";
      const stream = await createResponseRequestStream({
        model: invalidModel,
      });

      await expectInvalidResponses({
        stream,
        error: {
          type: "invalid_request_error",
          code: "invalid_request_error",
          message: `Path: body.model - ${invalidModel} is not supported.`,
        },
      });
    });

    it("Should return error responses if max_output_tokens is > allowed limit", async () => {
      const max_output_tokens = 4001;
      const stream = await createResponseRequestStream({
        max_output_tokens,
      });

      await expectInvalidResponses({
        stream,
        error: {
          type: "invalid_request_error",
          code: "invalid_request_error",
          message: `Path: body.max_output_tokens - ${max_output_tokens} is greater than the maximum allowed 4000.`,
        },
      });
    });

    it("Should return error responses if temperature is not 0", async () => {
      const stream = await createResponseRequestStream({
        temperature: 0.5 as any,
      });

      await expectInvalidResponses({
        stream,
        error: {
          type: "invalid_request_error",
          code: "invalid_request_error",
          message: "Path: body.temperature - Temperature must be 0",
        },
      });
    });

    it("Should return error responses if stream is false", async () => {
      // Override the default stream: true
      const stream = await openAiClient.responses.create({
        model: "mongodb-chat-latest",
        input: "What is MongoDB?",
        stream: false,
        temperature: 0,
      });

      await expectInvalidResponses({
        stream,
        error: {
          type: "invalid_request_error",
          code: "invalid_request_error",
          message: "'stream' must be true",
        },
      });
    });
  });

  describe("Real OpenAI integration", () => {
    it("Should handle actual conversation flow", async () => {
      // Create initial conversation
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Hello, can you tell me about MongoDB?" },
      ];
      const { messages } = await conversations.create({ initialMessages });

      // Get response using previous_response_id
      const previous_response_id = messages.at(-1)?.id.toString();
      const stream = await createResponseRequestStream({
        previous_response_id,
        input: "Tell me more about MongoDB Atlas",
      });

      await expectValidResponses({ stream });
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

      await Promise.all([
        expectValidResponses({ stream: stream1 }),
        expectValidResponses({ stream: stream2 }),
      ]);
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

  // Check for required response types
  const responseTypes = responses.map((r) => r.type);
  expect(responseTypes).toContain("response.created");
  expect(responseTypes).toContain("response.in_progress");
  expect(responseTypes).toContain("response.completed");

  // Validate response structure
  responses.forEach(({ response, sequence_number }, index) => {
    if (response) {
      expect(typeof response.id).toBe("string");
      expect(typeof response.created_at).toBe("number");
      expect(response.object).toBe("response");
      expect(response.error).toBeNull();
      expect(response.model).toBe("mongodb-chat-latest");
      expect(response.stream).toBe(true);
      expect(response.temperature).toBe(0);

      // Check conditional properties based on request body
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
};

interface ExpectInvalidResponsesArgs {
  stream: any;
  error: {
    type: string;
    code: string;
    message: string;
  };
}

const expectInvalidResponses = async ({
  stream,
  error,
}: ExpectInvalidResponsesArgs) => {
  const responses: any[] = [];
  for await (const event of stream) {
    responses.push(event);
  }

  expect(responses.length).toBe(1);
  expect(responses[0].type).toBe("error");
  expect(responses[0].error).toEqual(error);
};
