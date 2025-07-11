import "dotenv/config";
import type { Server } from "http";
import { ObjectId } from "mongodb";
import type {
  Conversation,
  ConversationsService,
  SomeMessage,
} from "mongodb-rag-core";
import { type AppConfig } from "../../app";
import {
  makeTestLocalServer,
  makeOpenAiClient,
  makeCreateResponseRequest,
  formatOpenAIStreamError,
  collectStreamingResponse,
} from "../../test/testHelpers";
import { makeDefaultConfig } from "../../test/testConfig";
import { ERROR_TYPE, ERROR_CODE } from "./errors";
import { ERR_MSG, type CreateResponseRequest } from "./createResponse";

jest.setTimeout(100000);

describe("POST /responses", () => {
  let appConfig: AppConfig;
  let server: Server;
  let ipAddress: string;
  let origin: string;
  let conversations: ConversationsService;

  beforeEach(async () => {
    appConfig = await makeDefaultConfig();

    ({ conversations } = appConfig.responsesRouterConfig.createResponse);

    ({ server, ipAddress, origin } = await makeTestLocalServer(appConfig));
  });

  afterEach(async () => {
    if (server?.listening) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    jest.restoreAllMocks();
  });

  const makeClientAndRequest = (
    body?: Partial<CreateResponseRequest["body"]>
  ) => {
    const openAiClient = makeOpenAiClient(origin, ipAddress);
    return makeCreateResponseRequest(openAiClient, body);
  };

  describe("Valid requests", () => {
    it("Should return 200 given a string input", async () => {
      const { response } = await makeClientAndRequest();
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody: {}, responses: results });
    });

    it("Should return 200 given a message array input", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        input: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: "What is MongoDB?" },
          { role: "assistant", content: "MongoDB is a document database." },
          { role: "user", content: "What is a document database?" },
        ],
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 given a valid request with instructions", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        instructions: "You are a helpful chatbot.",
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with valid max_output_tokens", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        max_output_tokens: 4000,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with valid metadata", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        metadata: { key1: "value1", key2: "value2" },
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with valid temperature", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        temperature: 0,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with previous_response_id", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages[messages.length - 1].id.toString();
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        previous_response_id,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 if previous_response_id is the latest message", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
        { role: "assistant", content: "Initial response!" },
        { role: "user", content: "Another message!" },
      ];
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages[messages.length - 1].id.toString();
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        previous_response_id,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with user", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        user: "some-user-id",
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with store=false", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: false,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with store=true", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: true,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with tools and tool_choice", async () => {
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
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with a specific function tool_choice", async () => {
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
        tool_choice: {
          type: "function",
          name: "test-tool",
        },
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 given a message array with function_call", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
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
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 given a message array with function_call_output", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        input: [
          { role: "user", content: "What is MongoDB?" },
          {
            type: "function_call_output",
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "completed",
          },
        ],
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with tool_choice 'none'", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        tool_choice: "none",
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should return 200 with an empty tools array", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        tools: [],
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });
    });

    it("Should store conversation messages if `storeMessageContent: undefined` and `store: true`", async () => {
      const storeMessageContent = undefined;
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const { _id, messages } = await conversations.create({
        storeMessageContent,
        initialMessages,
      });

      const store = true;
      const previous_response_id = messages[messages.length - 1].id.toString();
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        previous_response_id,
        store,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      const updatedConversation = await conversations.findById({ _id });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });

      expect(updatedConversation?.storeMessageContent).toEqual(
        storeMessageContent
      );
      testDefaultMessageContent({
        initialMessages,
        updatedConversation,
        store,
      });
    });

    it("Should store conversation messages when `store: true`", async () => {
      const store = true;
      const userId = "customUserId";
      const metadata = {
        customMessage1: "customMessage1",
        customMessage2: "customMessage2",
      };
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        metadata,
        user: userId,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });

      expect(updatedConversation.storeMessageContent).toEqual(store);
      testDefaultMessageContent({
        updatedConversation,
        userId,
        store,
        metadata,
      });
    });

    it("Should not store conversation messages when `store: false`", async () => {
      const store = false;
      const userId = "customUserId";
      const metadata = {
        customMessage1: "customMessage1",
        customMessage2: "customMessage2",
      };
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        metadata,
        user: userId,
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });

      expect(updatedConversation.storeMessageContent).toEqual(store);
      testDefaultMessageContent({
        updatedConversation,
        userId,
        store,
        metadata,
      });
    });

    it("Should store function_call messages when `store: true`", async () => {
      const store = true;
      const functionCallType = "function_call";
      const functionCallOutputType = "function_call_output";
      const requestBody: Partial<CreateResponseRequest["body"]> = {
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
      };
      const { response } = await makeClientAndRequest(requestBody);
      const results = await collectStreamingResponse(response);

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(response.status).toBe(200);
      testResponses({ requestBody, responses: results });

      expect(updatedConversation.storeMessageContent).toEqual(store);

      expect(updatedConversation.messages[0].role).toEqual("system");
      expect(updatedConversation.messages[0].content).toEqual(functionCallType);

      expect(updatedConversation.messages[1].role).toEqual("system");
      expect(updatedConversation.messages[1].content).toEqual(
        functionCallOutputType
      );
    });
  });

  describe("Invalid requests", () => {
    it("Should return 400 with an empty input string", async () => {
      const { response } = await makeClientAndRequest({
        input: "",
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: `Path: body.input - ${ERR_MSG.INPUT_STRING}`,
      });
    });

    it("Should return 400 with an empty message array", async () => {
      const { response } = await makeClientAndRequest({
        input: [],
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: `Path: body.input - ${ERR_MSG.INPUT_ARRAY}`,
      });
    });

    it("Should return 400 if model is not mongodb-chat-latest", async () => {
      const { response } = await makeClientAndRequest({
        model: "gpt-4o-mini",
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.MODEL_NOT_SUPPORTED("gpt-4o-mini"),
      });
    });

    // TODO: fix this test, throwing an uncaught error for some reaosn
    it.skip("Should return 400 if stream is not true", async () => {
      const { response } = await makeClientAndRequest({
        stream: false,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: `Path: body.stream - ${ERR_MSG.STREAM}`,
      });
    });

    it("Should return 400 if max_output_tokens is > allowed limit", async () => {
      const max_output_tokens = 4001;
      const { response } = await makeClientAndRequest({
        max_output_tokens,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.MAX_OUTPUT_TOKENS(max_output_tokens, 4000),
      });
    });

    it("Should return 400 if metadata has too many fields", async () => {
      const metadata: Record<string, string> = {};
      for (let i = 0; i < 17; i++) {
        metadata[`key${i}`] = "value";
      }
      const { response } = await makeClientAndRequest({
        metadata,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: `Path: body.metadata - ${ERR_MSG.METADATA_LENGTH}`,
      });
    });

    it("Should return 400 if metadata value is too long", async () => {
      const { response } = await makeClientAndRequest({
        metadata: { key1: "a".repeat(513) },
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message:
          "Path: body.metadata.key1 - String must contain at most 512 character(s)",
      });
    });

    it("Should return 400 if temperature is not 0", async () => {
      const { response } = await makeClientAndRequest({
        temperature: 0.5 as any,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: `Path: body.temperature - ${ERR_MSG.TEMPERATURE}`,
      });
    });

    it("Should return 400 if messages contain an invalid role", async () => {
      const { response } = await makeClientAndRequest({
        input: [
          { role: "user", content: "What is MongoDB?" },
          {
            role: "invalid-role" as any,
            content: "This is an invalid role.",
          },
        ],
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return 400 if function_call has an invalid status", async () => {
      const { response } = await makeClientAndRequest({
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
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return 400 if function_call_output has an invalid status", async () => {
      const { response } = await makeClientAndRequest({
        input: [
          {
            type: "function_call_output",
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "invalid_status" as any,
          },
        ],
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return 400 with an invalid tool_choice string", async () => {
      const { response } = await makeClientAndRequest({
        tool_choice: "invalid_choice" as any,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: "Path: body.tool_choice - Invalid input",
      });
    });

    it("Should return 400 if max_output_tokens is negative", async () => {
      const { response } = await makeClientAndRequest({
        max_output_tokens: -1,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message:
          "Path: body.max_output_tokens - Number must be greater than or equal to 0",
      });
    });

    it("Should return 400 if previous_response_id is not a valid ObjectId", async () => {
      const previous_response_id = "some-id";
      const { response } = await makeClientAndRequest({
        previous_response_id,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.INVALID_OBJECT_ID(previous_response_id),
      });
    });

    it("Should return 400 if previous_response_id is not found", async () => {
      const previous_response_id = "123456789012123456789012";
      const { response } = await makeClientAndRequest({
        previous_response_id,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.MESSAGE_NOT_FOUND(previous_response_id),
      });
    });

    it("Should return 400 if previous_response_id is not the latest message", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
        { role: "assistant", content: "Initial response!" },
        { role: "user", content: "Another message!" },
      ];
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages[0].id.toString();
      const { response } = await makeClientAndRequest({
        previous_response_id,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.MESSAGE_NOT_LATEST(previous_response_id),
      });
    });

    it("Should return 400 if there are too many messages in the conversation", async () => {
      const { maxUserMessagesInConversation } =
        appConfig.responsesRouterConfig.createResponse;

      const initialMessages = Array(maxUserMessagesInConversation).fill({
        role: "user",
        content: "Initial message!",
      });
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages[messages.length - 1].id.toString();
      const { response } = await makeClientAndRequest({
        previous_response_id,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.TOO_MANY_MESSAGES(maxUserMessagesInConversation),
      });
    });

    it("Should return 400 if user id has changed since the conversation was created", async () => {
      const userId = "user1";
      const badUserId = "user2";

      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const { messages } = await conversations.create({
        userId,
        initialMessages,
      });

      const previous_response_id = messages[messages.length - 1].id.toString();
      const { response } = await makeClientAndRequest({
        previous_response_id,
        user: badUserId,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.CONVERSATION_USER_ID_CHANGED,
      });
    });

    it("Should return 400 if `store: false` and `previous_response_id` is provided", async () => {
      const { response } = await makeClientAndRequest({
        previous_response_id: "123456789012123456789012",
        store: false,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.STORE_NOT_SUPPORTED,
      });
    });

    it("Should return 400 if `store: true` and `storeMessageContent: false`", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const { messages } = await conversations.create({
        storeMessageContent: false,
        initialMessages,
      });

      const previous_response_id = messages[messages.length - 1].id.toString();
      const { response } = await makeClientAndRequest({
        previous_response_id,
        store: true,
      });
      const results = await collectStreamingResponse(response);

      expect(response.status).toBe(200);
      testInvalidResponses({
        responses: results,
        message: ERR_MSG.CONVERSATION_STORE_MISMATCH,
      });
    });
  });
});

// --- HELPERS ---

const getMessageIdFromResults = (results?: Array<any>) => {
  if (!results?.length) throw new Error("No results found");

  const messageId = results[results.length - 1]?.response?.id;

  if (typeof messageId !== "string") throw new Error("Message ID not found");

  return new ObjectId(messageId);
};

interface TestInvalidResponsesParams {
  responses: Array<any>;
  message: string;
}

const testInvalidResponses = ({
  responses,
  message,
}: TestInvalidResponsesParams) => {
  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(1);

  expect(responses[0].type).toBe(ERROR_TYPE);
  expect(responses[0].data).toEqual(
    formatOpenAIStreamError(400, ERROR_CODE.INVALID_REQUEST_ERROR, message)
  );
};

interface TestResponsesParams {
  requestBody: Partial<CreateResponseRequest["body"]>;
  responses: Array<any>;
}

const testResponses = ({ requestBody, responses }: TestResponsesParams) => {
  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(3);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");
  expect(responses[2].type).toBe("response.completed");

  responses.forEach(({ response, sequence_number }, index) => {
    // basic response properties
    expect(sequence_number).toBe(index);
    expect(typeof response.id).toBe("string");
    expect(typeof response.created_at).toBe("number");
    expect(response.object).toBe("response");
    expect(response.error).toBeNull();
    expect(response.incomplete_details).toBeNull();
    expect(response.model).toBe("mongodb-chat-latest");
    expect(response.output_text).toBe("");
    expect(response.output).toEqual([]);
    expect(response.parallel_tool_calls).toBe(true);
    expect(response.temperature).toBe(0);
    expect(response.stream).toBe(true);
    expect(response.top_p).toBeNull();

    // conditional upon request body properties
    if (requestBody.instructions) {
      expect(response.instructions).toBe(requestBody.instructions);
    } else {
      expect(response.instructions).toBeNull();
    }
    if (requestBody.max_output_tokens) {
      expect(response.max_output_tokens).toBe(requestBody.max_output_tokens);
    } else {
      expect(response.max_output_tokens).toBe(1000);
    }
    if (requestBody.previous_response_id) {
      expect(response.previous_response_id).toBe(
        requestBody.previous_response_id
      );
    } else {
      expect(response.previous_response_id).toBeNull();
    }
    if (typeof requestBody.store === "boolean") {
      expect(response.store).toBe(requestBody.store);
    } else {
      expect(response.store).toBe(true);
    }
    if (requestBody.tool_choice) {
      expect(response.tool_choice).toEqual(requestBody.tool_choice);
    } else {
      expect(response.tool_choice).toBe("auto");
    }
    if (requestBody.tools) {
      expect(response.tools).toEqual(requestBody.tools);
    } else {
      expect(response.tools).toEqual([]);
    }
    if (requestBody.user) {
      expect(response.user).toBe(requestBody.user);
    } else {
      expect(response.user).toBeUndefined();
    }
    if (requestBody.metadata) {
      expect(response.metadata).toEqual(requestBody.metadata);
    } else {
      expect(response.metadata).toBeNull();
    }
  });
};

interface TestDefaultMessageContentParams {
  initialMessages?: Array<SomeMessage>;
  updatedConversation: Conversation;
  store: boolean;
  userId?: string;
  metadata?: Record<string, string> | null;
}

const testDefaultMessageContent = ({
  initialMessages,
  updatedConversation,
  store,
  userId,
  metadata = null,
}: TestDefaultMessageContentParams) => {
  expect(updatedConversation.userId).toEqual(userId);
  if (metadata) expect(updatedConversation.customData).toEqual({ metadata });

  const defaultMessagesLength = 3;
  const initialMessagesLength = initialMessages?.length ?? 0;
  const totalMessagesLength = defaultMessagesLength + initialMessagesLength;

  const { messages } = updatedConversation;
  expect(messages.length).toEqual(totalMessagesLength);

  initialMessages?.forEach((initialMessage, index) => {
    expect(messages[index].role).toEqual(initialMessage.role);
    expect(messages[index].content).toEqual(initialMessage.content);
    expect(messages[index].metadata).toEqual(initialMessage.metadata);
    expect(messages[index].customData).toEqual(initialMessage.customData);
  });

  const firstMessage = messages[initialMessagesLength];
  const secondMessage = messages[initialMessagesLength + 1];
  const thirdMessage = messages[initialMessagesLength + 2];

  expect(firstMessage.role).toBe("user");
  expect(firstMessage.content).toBe(store ? "What is MongoDB?" : "");
  expect(firstMessage.metadata).toEqual(metadata);

  expect(secondMessage.role).toEqual("user");
  expect(secondMessage.content).toBeFalsy();
  expect(secondMessage.metadata).toEqual(metadata);

  expect(thirdMessage.role).toEqual("assistant");
  expect(thirdMessage.content).toEqual(store ? "some content" : "");
  expect(thirdMessage.metadata).toEqual(metadata);
};
