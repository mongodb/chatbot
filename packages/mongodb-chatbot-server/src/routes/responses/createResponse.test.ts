import "dotenv/config";
import type { Server } from "http";
import { OpenAI, APIError } from "mongodb-rag-core/openai";
import type { Conversation, SomeMessage } from "mongodb-rag-core";
import { DEFAULT_API_PREFIX, type AppConfig } from "../../app";
import {
  TEST_OPENAI_API_KEY,
  makeTestLocalServer,
  collectStreamingResponse,
  type PartialAppConfig,
} from "../../test/testHelpers";
import { basicResponsesRequestBody } from "../../test/testConfig";
import { ERROR_TYPE, ERROR_CODE } from "./errors";
import { ERR_MSG, type CreateResponseRequest } from "./createResponse";

jest.setTimeout(100000);

describe("POST /responses", () => {
  let server: Server;
  let appConfig: AppConfig;
  let overrideAppConfig: PartialAppConfig = {};
  let ipAddress: string;
  let origin: string;

  beforeEach(async () => {
    ({ server, appConfig, ipAddress, origin } = await makeTestLocalServer(
      overrideAppConfig
    ));
  });

  afterEach(() => {
    server.close();
    jest.restoreAllMocks();
  });

  const makeCreateResponseRequest = (
    body?: Partial<CreateResponseRequest["body"]>
  ) => {
    const openAiClient = new OpenAI({
      baseURL: origin + DEFAULT_API_PREFIX,
      apiKey: TEST_OPENAI_API_KEY,
      defaultHeaders: {
        Origin: origin,
        "X-Forwarded-For": ipAddress,
      },
    });

    return openAiClient.responses
      .create({
        ...basicResponsesRequestBody,
        ...body,
      })
      .withResponse();
  };

  describe("Valid requests", () => {
    it("Should return 200 given a string input", async () => {
      const { data: stream, response } = await makeCreateResponseRequest();
      const content = await collectStreamingResponse(stream);

      expect(response.status).toBe(200);
      expect(content).toContain("");
    });

    it("Should return 200 given a message array input", async () => {
      const { response } = await makeCreateResponseRequest({
        input: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is MongoDB?" },
          { role: "assistant", content: "MongoDB is a document database." },
          { role: "user", content: "What is a document database?" },
        ],
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 given a valid request with instructions", async () => {
      const { response } = await makeCreateResponseRequest({
        instructions: "You are a helpful chatbot.",
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with valid max_output_tokens", async () => {
      const { response } = await makeCreateResponseRequest({
        max_output_tokens: 4000,
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with valid metadata", async () => {
      const { response } = await makeCreateResponseRequest({
        metadata: { key1: "value1", key2: "value2" },
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with valid temperature", async () => {
      const { response } = await makeCreateResponseRequest({
        temperature: 0,
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with previous_response_id", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          initialMessages: [{ role: "user", content: "What is MongoDB?" }],
        });

      const previousResponseId = conversation.messages[0].id;
      const { response } = await makeCreateResponseRequest({
        previous_response_id: previousResponseId.toString(),
      });

      expect(response.status).toBe(200);
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
      const { response } = await makeCreateResponseRequest({
        previous_response_id: previousResponseId.toString(),
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with user", async () => {
      const { response } = await makeCreateResponseRequest({
        user: "some-user-id",
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with store=false", async () => {
      const { response } = await makeCreateResponseRequest({
        store: false,
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with store=true", async () => {
      const { response } = await makeCreateResponseRequest({
        store: true,
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with tools and tool_choice", async () => {
      const { response } = await makeCreateResponseRequest({
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
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with a specific function tool_choice", async () => {
      const { response } = await makeCreateResponseRequest({
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
        tool_choice: {
          type: "function",
          name: "test-tool",
        },
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 given a message array with function_call", async () => {
      const { response } = await makeCreateResponseRequest({
        input: [
          { role: "user", content: "What is MongoDB?" },
          {
            type: "function_call",
            call_id: "call123",
            name: "my_function",
            arguments: `{"query": "value"}`,
            status: "in_progress",
          },
        ],
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 given a message array with function_call_output", async () => {
      const { response } = await makeCreateResponseRequest({
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

      expect(response.status).toBe(200);
    });

    it("Should return 200 with tool_choice 'none'", async () => {
      const { response } = await makeCreateResponseRequest({
        tool_choice: "none",
      });

      expect(response.status).toBe(200);
    });

    it("Should return 200 with an empty tools array", async () => {
      const { response } = await makeCreateResponseRequest({
        tools: [],
      });

      expect(response.status).toBe(200);
    });

    it("Should store conversation messages if `storeMessageContent: undefined` and `store: true`", async () => {
      const createSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "create"
      );
      const addMessagesSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "addManyConversationMessages"
      );

      const storeMessageContent = undefined;
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          storeMessageContent,
          initialMessages: [{ role: "user", content: "What is MongoDB?" }],
        });

      const store = true;
      const previousResponseId = conversation.messages[0].id.toString();
      const { response } = await makeCreateResponseRequest({
        previous_response_id: previousResponseId,
        store,
      });

      const createdConversation = await createSpy.mock.results[0].value;
      const addedMessages = await addMessagesSpy.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(createdConversation.storeMessageContent).toEqual(
        storeMessageContent
      );
      testDefaultMessageContent({
        createdConversation,
        addedMessages,
        store,
      });
    });

    it("Should store conversation messages when `store: true`", async () => {
      const createSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "create"
      );
      const addMessagesSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "addManyConversationMessages"
      );

      const store = true;
      const userId = "customUserId";
      const metadata = {
        customMessage1: "customMessage1",
        customMessage2: "customMessage2",
      };
      const { response } = await makeCreateResponseRequest({
        store,
        metadata,
        user: userId,
      });

      const createdConversation = await createSpy.mock.results[0].value;
      const addedMessages = await addMessagesSpy.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(createdConversation.storeMessageContent).toEqual(store);
      testDefaultMessageContent({
        createdConversation,
        addedMessages,
        userId,
        store,
        metadata,
      });
    });

    it("Should not store conversation messages when `store: false`", async () => {
      const createSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "create"
      );
      const addMessagesSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "addManyConversationMessages"
      );

      const store = false;
      const userId = "customUserId";
      const metadata = {
        customMessage1: "customMessage1",
        customMessage2: "customMessage2",
      };
      const { response } = await makeCreateResponseRequest({
        store,
        metadata,
        user: userId,
      });

      const createdConversation = await createSpy.mock.results[0].value;
      const addedMessages = await addMessagesSpy.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(createdConversation.storeMessageContent).toEqual(store);
      testDefaultMessageContent({
        createdConversation,
        addedMessages,
        userId,
        store,
        metadata,
      });
    });

    it("Should store function_call messages when `store: true`", async () => {
      const createSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "create"
      );
      const addMessagesSpy = jest.spyOn(
        appConfig.conversationsRouterConfig.conversations,
        "addManyConversationMessages"
      );

      const store = true;
      const functionCallType = "function_call";
      const functionCallOutputType = "function_call_output";
      const { response } = await makeCreateResponseRequest({
        store,
        input: [
          {
            type: functionCallType,
            call_id: "call123",
            name: "my_function",
            arguments: `{"query": "value"}`,
            status: "in_progress",
          },
          {
            type: functionCallOutputType,
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "completed",
          },
        ],
      });

      const createdConversation = await createSpy.mock.results[0].value;
      const addedMessages = await addMessagesSpy.mock.results[0].value;

      expect(response.status).toBe(200);
      expect(createdConversation.storeMessageContent).toEqual(store);

      expect(addedMessages[0].role).toEqual("system");
      expect(addedMessages[1].role).toEqual("system");

      expect(addedMessages[0].content).toEqual(functionCallType);
      expect(addedMessages[1].content).toEqual(functionCallOutputType);
    });
  });

  describe("Invalid requests", () => {
    it("Should return 400 with an empty input string", async () => {
      try {
        await makeCreateResponseRequest({
          input: "",
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(`Path: body.input - ${ERR_MSG.INPUT_STRING}`)
        );
      }
    });

    it("Should return 400 with an empty message array", async () => {
      try {
        await makeCreateResponseRequest({
          input: [],
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(`Path: body.input - ${ERR_MSG.INPUT_ARRAY}`)
        );
      }
    });

    it("Should return 400 if model is not mongodb-chat-latest", async () => {
      try {
        await makeCreateResponseRequest({
          model: "gpt-4o-mini",
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.MODEL_NOT_SUPPORTED("gpt-4o-mini"))
        );
      }
    });

    it("Should return 400 if stream is not true", async () => {
      try {
        await makeCreateResponseRequest({
          stream: false,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(`Path: body.stream - ${ERR_MSG.STREAM}`)
        );
      }
    });

    it("Should return 400 if max_output_tokens is > allowed limit", async () => {
      const max_output_tokens = 4001;
      try {
        await makeCreateResponseRequest({
          max_output_tokens,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.MAX_OUTPUT_TOKENS(max_output_tokens, 4000))
        );
      }
    });

    it("Should return 400 if metadata has too many fields", async () => {
      const metadata: Record<string, string> = {};
      for (let i = 0; i < 17; i++) {
        metadata[`key${i}`] = "value";
      }
      try {
        await makeCreateResponseRequest({
          metadata,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(`Path: body.metadata - ${ERR_MSG.METADATA_LENGTH}`)
        );
      }
    });

    it("Should return 400 if metadata value is too long", async () => {
      try {
        await makeCreateResponseRequest({
          metadata: { key1: "a".repeat(513) },
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(
            "Path: body.metadata.key1 - String must contain at most 512 character(s)"
          )
        );
      }
    });

    it("Should return 400 if temperature is not 0", async () => {
      try {
        await makeCreateResponseRequest({
          temperature: 0.5 as any,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(`Path: body.temperature - ${ERR_MSG.TEMPERATURE}`)
        );
      }
    });

    it("Should return 400 if messages contain an invalid role", async () => {
      try {
        await makeCreateResponseRequest({
          input: [
            { role: "user", content: "What is MongoDB?" },
            {
              role: "invalid-role" as any,
              content: "This is an invalid role.",
            },
          ],
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError("Path: body.input - Invalid input")
        );
      }
    });

    it("Should return 400 if function_call has an invalid status", async () => {
      try {
        await makeCreateResponseRequest({
          input: [
            {
              type: "function_call",
              call_id: "call123",
              name: "my_function",
              arguments: `{"query": "value"}`,
              status: "invalid_status" as any,
            },
          ],
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError("Path: body.input - Invalid input")
        );
      }
    });

    it("Should return 400 if function_call_output has an invalid status", async () => {
      try {
        await makeCreateResponseRequest({
          input: [
            {
              type: "function_call_output",
              call_id: "call123",
              output: `{"result": "success"}`,
              status: "invalid_status" as any,
            },
          ],
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError("Path: body.input - Invalid input")
        );
      }
    });

    it("Should return 400 with an invalid tool_choice string", async () => {
      try {
        await makeCreateResponseRequest({
          tool_choice: "invalid_choice" as any,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError("Path: body.tool_choice - Invalid input")
        );
      }
    });

    it("Should return 400 if max_output_tokens is negative", async () => {
      try {
        await makeCreateResponseRequest({
          max_output_tokens: -1,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(
            "Path: body.max_output_tokens - Number must be greater than or equal to 0"
          )
        );
      }
    });

    it("Should return 400 if previous_response_id is not a valid ObjectId", async () => {
      const messageId = "some-id";

      try {
        await makeCreateResponseRequest({
          previous_response_id: messageId,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.INVALID_OBJECT_ID(messageId))
        );
      }
    });

    it("Should return 400 if previous_response_id is not found", async () => {
      const messageId = "123456789012123456789012";

      try {
        await makeCreateResponseRequest({
          previous_response_id: messageId,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.INVALID_OBJECT_ID(messageId))
        );
      }
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
      try {
        await makeCreateResponseRequest({
          previous_response_id: previousResponseId.toString(),
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(
            ERR_MSG.MESSAGE_NOT_LATEST(previousResponseId.toString())
          )
        );
      }
    });

    it("Should return 400 if there are too many messages in the conversation", async () => {
      const maxUserMessagesInConversation = 0;
      overrideAppConfig = {
        responsesRouterConfig: {
          ...appConfig.responsesRouterConfig,
          createResponse: {
            ...appConfig.responsesRouterConfig.createResponse,
            maxUserMessagesInConversation,
          },
        },
      };

      try {
        await makeCreateResponseRequest();
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(
            ERR_MSG.TOO_MANY_MESSAGES(maxUserMessagesInConversation)
          )
        );
      }
    });

    it("Should return 400 if user id has changed since the conversation was created", async () => {
      const userId1 = "user1";
      const userId2 = "user2";
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          userId: userId1,
          initialMessages: [{ role: "user", content: "What is MongoDB?" }],
        });

      const previousResponseId = conversation.messages[0].id.toString();
      try {
        await makeCreateResponseRequest({
          previous_response_id: previousResponseId,
          user: userId2,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.CONVERSATION_USER_ID_CHANGED)
        );
      }
    });

    it("Should return 400 if `store: false` and `previous_response_id` is provided", async () => {
      try {
        await makeCreateResponseRequest({
          previous_response_id: "123456789012123456789012",
          store: false,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.STORE_NOT_SUPPORTED)
        );
      }
    });

    it("Should return 400 if `store: true` and `storeMessageContent: false`", async () => {
      const conversation =
        await appConfig.conversationsRouterConfig.conversations.create({
          storeMessageContent: false,
          initialMessages: [{ role: "user", content: "" }],
        });

      const previousResponseId = conversation.messages[0].id.toString();
      try {
        await makeCreateResponseRequest({
          previous_response_id: previousResponseId,
          store: true,
        });
        throw new Error("Should not reach this line");
      } catch (error) {
        expect(error instanceof APIError).toBe(true);
        expect((error as APIError).status).toBe(400);
        expect((error as APIError).error).toEqual(
          badRequestError(ERR_MSG.CONVERSATION_STORE_MISMATCH)
        );
      }
    });
  });
});

// --- HELPERS ---

const badRequestError = (message: string) => ({
  type: ERROR_TYPE,
  code: ERROR_CODE.INVALID_REQUEST_ERROR,
  message,
});

interface TestDefaultMessageContentParams {
  createdConversation: Conversation;
  addedMessages: SomeMessage[];
  store: boolean;
  userId?: string;
  metadata?: Record<string, string>;
}

const testDefaultMessageContent = ({
  createdConversation,
  addedMessages,
  store,
  userId,
  metadata,
}: TestDefaultMessageContentParams) => {
  expect(createdConversation.userId).toEqual(userId);

  expect(addedMessages[0].role).toBe("user");
  expect(addedMessages[1].role).toEqual("user");
  expect(addedMessages[2].role).toEqual("assistant");

  expect(addedMessages[0].content).toBe(store ? "What is MongoDB?" : "");
  expect(addedMessages[1].content).toBeFalsy();
  expect(addedMessages[2].content).toEqual(store ? "some content" : "");

  expect(addedMessages[0].metadata).toEqual(metadata);
  expect(addedMessages[1].metadata).toEqual(metadata);
  expect(addedMessages[2].metadata).toEqual(metadata);
  if (metadata) expect(createdConversation.customData).toEqual({ metadata });
};
