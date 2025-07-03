import "dotenv/config";
import request from "supertest";
import type { Express } from "express";
import { DEFAULT_API_PREFIX, type AppConfig } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { basicResponsesRequestBody } from "../../test/testConfig";
import { ERROR_TYPE, ERROR_CODE } from "./errors";
import { ERR_MSG, type CreateResponseRequest } from "./createResponse";

jest.setTimeout(100000);

const badRequestError = (message: string) => ({
  type: ERROR_TYPE,
  code: ERROR_CODE.INVALID_REQUEST_ERROR,
  message,
});

describe("POST /responses", () => {
  const endpointUrl = `${DEFAULT_API_PREFIX}/responses`;
  let app: Express;
  let appConfig: AppConfig;
  let ipAddress: string;
  let origin: string;

  beforeEach(async () => {
    ({ app, ipAddress, origin, appConfig } = await makeTestApp());
  });

  const makeCreateResponseRequest = (
    body?: Partial<CreateResponseRequest["body"]>,
    appOverride?: Express
  ) => {
    return request(appOverride ?? app)
      .post(endpointUrl)
      .set("X-Forwarded-For", ipAddress)
      .set("Origin", origin)
      .send({ ...basicResponsesRequestBody, ...body });
  };

  describe("Valid requests", () => {
    it("Should return 200 given a string input", async () => {
      const response = await makeCreateResponseRequest();

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a message array input", async () => {
      const response = await makeCreateResponseRequest({
        input: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is MongoDB?" },
          { role: "assistant", content: "MongoDB is a document database." },
          { role: "user", content: "What is a document database?" },
        ],
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a valid request with instructions", async () => {
      const response = await makeCreateResponseRequest({
        instructions: "You are a helpful chatbot.",
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with valid max_output_tokens", async () => {
      const response = await makeCreateResponseRequest({
        max_output_tokens: 4000,
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with valid metadata", async () => {
      const response = await makeCreateResponseRequest({
        metadata: { key1: "value1", key2: "value2" },
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with valid temperature", async () => {
      const response = await makeCreateResponseRequest({
        temperature: 0,
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with previous_response_id", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          initialMessages: [{ role: "user", content: "What is MongoDB?" }],
        });

      const previousResponseId = conversation.messages[0].id;
      const response = await makeCreateResponseRequest({
        previous_response_id: previousResponseId.toString(),
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 if previous_response_id is the latest message", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          initialMessages: [
            { role: "user", content: "What is MongoDB?" },
            { role: "assistant", content: "MongoDB is a document database." },
            { role: "user", content: "What is a document database?" },
          ],
        });

      const previousResponseId = conversation.messages[2].id;
      const response = await makeCreateResponseRequest({
        previous_response_id: previousResponseId.toString(),
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with user", async () => {
      const response = await makeCreateResponseRequest({
        user: "some-user-id",
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with store=false", async () => {
      const response = await makeCreateResponseRequest({
        store: false,
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with store=true", async () => {
      const response = await makeCreateResponseRequest({
        store: true,
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with tools and tool_choice", async () => {
      const response = await makeCreateResponseRequest({
        tools: [
          {
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
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with a specific function tool_choice", async () => {
      const response = await makeCreateResponseRequest({
        tools: [
          {
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
        tool_choice: {
          type: "function",
          name: "test-tool",
        },
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a message array with function_call", async () => {
      const response = await makeCreateResponseRequest({
        input: [
          { role: "user", content: "What is MongoDB?" },
          {
            type: "function_call",
            id: "call123",
            name: "my_function",
            arguments: `{"query": "value"}`,
            status: "in_progress",
          },
        ],
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 given a message array with function_call_output", async () => {
      const response = await makeCreateResponseRequest({
        input: [
          { role: "user", content: "What is MongoDB?" },
          {
            type: "function_call_output",
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "completed",
          },
        ],
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with tool_choice 'none'", async () => {
      const response = await makeCreateResponseRequest({
        tool_choice: "none",
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with tool_choice 'only'", async () => {
      const response = await makeCreateResponseRequest({
        tool_choice: "only",
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 with an empty tools array", async () => {
      const response = await makeCreateResponseRequest({
        tools: [],
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should return 200 if conversation store flag is undefined (should default to true) and store is true", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          initialMessages: [
            {
              role: "user",
              content: "What is MongoDB?",
              customData: {
                store: undefined,
              },
            },
          ],
        });

      const previousResponseId = conversation.messages[0].id.toString();
      const response = await makeCreateResponseRequest({
        previous_response_id: previousResponseId,
        store: true,
      });

      expect(response.statusCode).toBe(200);
    });

    it("Should properly store conversations when store flag is true", async () => {
      const createSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "create"
      );

      const store = true;
      const userId = "customUserId";
      const metadata = {
        customMessage1: "customMessage1",
        customMessage2: "customMessage2",
      };
      const response = await makeCreateResponseRequest({
        store,
        metadata,
        user: userId,
      });

      const createdConversation = await createSpy.mock.results[0].value;

      expect(response.statusCode).toBe(200);
      expect(createdConversation.customData).toEqual({
        store,
        metadata,
        userId,
      });
    });

    it("Should properly store conversations when store flag is false", async () => {
      const createSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "create"
      );

      const store = false;
      const userId = "customUserId";
      const metadata = {
        customMessage1: "customMessage1",
        customMessage2: "customMessage2",
      };
      const response = await makeCreateResponseRequest({
        store,
        metadata,
        user: userId,
      });

      const createdConversation = await createSpy.mock.results[0].value;

      expect(response.statusCode).toBe(200);
      expect(createdConversation.customData).toEqual({
        store,
        metadata,
        userId,
      });
    });
  });

  describe("Invalid requests", () => {
    it("Should return 400 with an empty input string", async () => {
      const response = await makeCreateResponseRequest({
        input: "",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.input - ${ERR_MSG.INPUT_STRING}`)
      );
    });

    it("Should return 400 with an empty message array", async () => {
      const response = await makeCreateResponseRequest({
        input: [],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.input - ${ERR_MSG.INPUT_ARRAY}`)
      );
    });

    it("Should return 400 if model is not mongodb-chat-latest", async () => {
      const response = await makeCreateResponseRequest({
        model: "gpt-4o-mini",
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(ERR_MSG.MODEL_NOT_SUPPORTED("gpt-4o-mini"))
      );
    });

    it("Should return 400 if stream is not true", async () => {
      const response = await makeCreateResponseRequest({
        stream: false,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.stream - ${ERR_MSG.STREAM}`)
      );
    });

    it("Should return 400 if max_output_tokens is > allowed limit", async () => {
      const max_output_tokens = 4001;

      const response = await makeCreateResponseRequest({
        max_output_tokens,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(ERR_MSG.MAX_OUTPUT_TOKENS(max_output_tokens, 4000))
      );
    });

    it("Should return 400 if metadata has too many fields", async () => {
      const metadata: Record<string, string> = {};
      for (let i = 0; i < 17; i++) {
        metadata[`key${i}`] = "value";
      }
      const response = await makeCreateResponseRequest({
        metadata,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.metadata - ${ERR_MSG.METADATA_LENGTH}`)
      );
    });

    it("Should return 400 if metadata value is too long", async () => {
      const response = await makeCreateResponseRequest({
        metadata: { key1: "a".repeat(513) },
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(
          "Path: body.metadata.key1 - String must contain at most 512 character(s)"
        )
      );
    });

    it("Should return 400 if temperature is not 0", async () => {
      const response = await makeCreateResponseRequest({
        temperature: 0.5 as any,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(`Path: body.temperature - ${ERR_MSG.TEMPERATURE}`)
      );
    });

    it("Should return 400 if messages contain an invalid role", async () => {
      const response = await makeCreateResponseRequest({
        input: [
          { role: "user", content: "What is MongoDB?" },
          { role: "invalid-role" as any, content: "This is an invalid role." },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.input - Invalid input")
      );
    });

    it("Should return 400 if function_call has an invalid status", async () => {
      const response = await makeCreateResponseRequest({
        input: [
          {
            type: "function_call",
            id: "call123",
            name: "my_function",
            arguments: `{"query": "value"}`,
            status: "invalid_status" as any,
          },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.input - Invalid input")
      );
    });

    it("Should return 400 if function_call_output has an invalid status", async () => {
      const response = await makeCreateResponseRequest({
        input: [
          {
            type: "function_call_output",
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "invalid_status" as any,
          },
        ],
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.input - Invalid input")
      );
    });

    it("Should return 400 with an invalid tool_choice string", async () => {
      const response = await makeCreateResponseRequest({
        tool_choice: "invalid_choice" as any,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError("Path: body.tool_choice - Invalid input")
      );
    });

    it("Should return 400 if max_output_tokens is negative", async () => {
      const response = await makeCreateResponseRequest({
        max_output_tokens: -1,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(
          "Path: body.max_output_tokens - Number must be greater than or equal to 0"
        )
      );
    });

    it("Should return 400 if previous_response_id is not a valid ObjectId", async () => {
      const messageId = "some-id";

      const response = await makeCreateResponseRequest({
        previous_response_id: messageId,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(ERR_MSG.INVALID_OBJECT_ID(messageId))
      );
    });

    it("Should return 400 if previous_response_id is not found", async () => {
      const messageId = "123456789012123456789012";

      const response = await makeCreateResponseRequest({
        previous_response_id: messageId,
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(ERR_MSG.MESSAGE_NOT_FOUND(messageId))
      );
    });

    it("Should return 400 if previous_response_id is not the latest message", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          initialMessages: [
            { role: "user", content: "What is MongoDB?" },
            { role: "assistant", content: "MongoDB is a document database." },
            { role: "user", content: "What is a document database?" },
          ],
        });

      const previousResponseId = conversation.messages[0].id;
      const response = await makeCreateResponseRequest({
        previous_response_id: previousResponseId.toString(),
      });

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(
          ERR_MSG.MESSAGE_NOT_LATEST(previousResponseId.toString())
        )
      );
    });

    it("Should return 400 if there are too many messages in the conversation", async () => {
      const maxUserMessagesInConversation = 0;
      const newApp = await makeTestApp({
        responsesRouterConfig: {
          ...appConfig.responsesRouterConfig,
          createResponse: {
            ...appConfig.responsesRouterConfig.createResponse,
            maxUserMessagesInConversation,
          },
        },
      });

      const response = await makeCreateResponseRequest({}, newApp.app);

      expect(response.statusCode).toBe(400);
      expect(response.body.error).toEqual(
        badRequestError(
          ERR_MSG.TOO_MANY_MESSAGES(maxUserMessagesInConversation)
        )
      );
    });
  });

  it("Should return 400 if user id has changed since the conversation was created", async () => {
    const userId1 = "user1";
    const userId2 = "user2";
    const conversation =
      await appConfig.conversationsRouterConfig.conversations.create({
        initialMessages: [
          {
            role: "user",
            content: "What is MongoDB?",
            customData: { userId: userId1 },
          },
        ],
      });

    const previousResponseId = conversation.messages[0].id.toString();
    const response = await makeCreateResponseRequest({
      previous_response_id: previousResponseId,
      user: userId2,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      badRequestError(ERR_MSG.CONVERSATION_USER_ID_CHANGED)
    );
  });

  it("Should return 400 if previous_response_id is provided but store is false", async () => {
    const response = await makeCreateResponseRequest({
      previous_response_id: "123456789012123456789012",
      store: false,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      badRequestError(ERR_MSG.STORE_NOT_SUPPORTED)
    );
  });

  it("Should return 400 if conversation store flag is false but store is true", async () => {
    const conversation =
      await appConfig.conversationsRouterConfig.conversations.create({
        initialMessages: [
          {
            role: "user",
            content: "",
            customData: {
              store: false,
            },
          },
        ],
      });

    const previousResponseId = conversation.messages[0].id.toString();
    const response = await makeCreateResponseRequest({
      previous_response_id: previousResponseId,
      store: true,
    });

    expect(response.statusCode).toBe(400);
    expect(response.body.error).toEqual(
      badRequestError(ERR_MSG.CONVERSATION_STORE_MISMATCH)
    );
  });
});
