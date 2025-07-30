import "dotenv/config";
import type { Server } from "http";
import { ObjectId } from "mongodb";
import type {
  Conversation,
  ConversationsService,
  SomeMessage,
  ToolMessage,
} from "mongodb-rag-core";
import { type AppConfig } from "../../app";
import {
  makeTestLocalServer,
  makeOpenAiClient,
  makeCreateResponseRequestStream,
  type Stream,
} from "../../test/testHelpers";
import {
  TEST_ALWAYS_ALLOWED_METADATA_KEYS,
  makeDefaultConfig,
} from "../../test/testConfig";
import {
  CREATE_RESPONSE_ERR_MSG,
  MAX_INPUT_LENGTH,
  MAX_INPUT_ARRAY_LENGTH,
  MAX_INSTRUCTIONS_LENGTH,
  MAX_TOOLS,
  MAX_TOOLS_CONTENT_LENGTH,
  creationInterface,
  type CreateResponseRequest,
} from "./createResponse";
import { ERROR_CODE, ERROR_TYPE } from "./errors";

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

    // use a unique port so this doesn't collide with other test suites
    const testPort = 5200;
    ({ server, ipAddress, origin } = await makeTestLocalServer(
      appConfig,
      testPort
    ));
  });

  afterEach(async () => {
    server?.listening && server?.close();
    jest.restoreAllMocks();
  });

  const makeClientAndRequest = (
    body?: Partial<CreateResponseRequest["body"]>,
    overrideOrigin?: string,
    overrideIpAddress?: string
  ) => {
    const openAiClient = makeOpenAiClient(
      overrideOrigin ?? origin,
      overrideIpAddress ?? ipAddress
    );
    return makeCreateResponseRequestStream(openAiClient, body);
  };

  describe("Valid requests", () => {
    it("Should return responses given a string input", async () => {
      const stream = await makeClientAndRequest();

      await expectValidResponses({ requestBody: {}, stream });
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses given a valid request with instructions", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        instructions: "You are a helpful chatbot.",
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with valid max_output_tokens", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        max_output_tokens: 4000,
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with valid metadata", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        metadata: { key1: "value1", key2: "value2" },
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with valid temperature", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        temperature: 0,
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses if previous_response_id is the latest message", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
        { role: "assistant", content: "Initial response!" },
        { role: "user", content: "Another message!" },
      ];
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages.at(-1)?.id.toString();
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        previous_response_id,
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with user", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        user: "some-user-id",
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with store=false", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: false,
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with store=true", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store: true,
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with a specific function tool_choice", async () => {
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses given a message array with function_call", async () => {
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses given a message array with function_call_output", async () => {
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with a valid tool_choice", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        tool_choice: "auto",
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
    });

    it("Should return responses with an empty tools array", async () => {
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        tools: [],
      };
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
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
      const stream = await makeClientAndRequest(requestBody);

      await expectValidResponses({ requestBody, stream });
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
      const previous_response_id = messages.at(-1)?.id.toString();
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        previous_response_id,
        store,
      };
      const stream = await makeClientAndRequest(requestBody);

      const updatedConversation = await conversations.findById({ _id });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      await expectValidResponses({ requestBody, stream });

      expect(updatedConversation?.storeMessageContent).toEqual(
        storeMessageContent
      );
      expectDefaultMessageContent({
        initialMessages,
        updatedConversation,
        store,
      });
    });

    it("Should store conversation messages with all metadata keys when `store: true`", async () => {
      const store = true;
      const userId = "customUserId";
      const metadata = {
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[0]]: "127.0.0.1",
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[1]]: "http://localhost:3000",
        notAllowedMetadataKey: "please STORE me in this scenario",
      };
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        metadata,
        user: userId,
      };
      const stream = await makeClientAndRequest(requestBody);

      const results = await expectValidResponses({ requestBody, stream });

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(updatedConversation.storeMessageContent).toEqual(store);
      expectDefaultMessageContent({
        updatedConversation,
        userId,
        store,
        metadata,
      });
    });

    it("Should not store message content or metadata fields (except alwaysAllowedMetadataKeys) when `store: false`", async () => {
      const store = false;
      const userId = "customUserId";
      const metadata = {
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[0]]: "127.0.0.1",
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[1]]: "http://localhost:3000",
        notAllowedMetadataKey: "please REMOVE me in this scenario",
      };
      const expectedMetadata = {
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[0]]: "127.0.0.1",
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[1]]: "http://localhost:3000",
        notAllowedMetadataKey: "",
      };
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        metadata,
        user: userId,
      };
      const stream = await makeClientAndRequest(requestBody);

      const results = await expectValidResponses({ requestBody, stream });

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(updatedConversation.storeMessageContent).toEqual(store);
      expectDefaultMessageContent({
        updatedConversation,
        userId,
        store,
        metadata: expectedMetadata,
      });
    });

    it("Should not store message content or ANY metadata fields when `store: false` and `alwaysAllowedMetadataKeys` is empty", async () => {
      const customConfig = await makeDefaultConfig();
      const testPort = 5201; // Use a different port
      customConfig.responsesRouterConfig.createResponse.alwaysAllowedMetadataKeys =
        [];
      const {
        server: customServer,
        ipAddress: customIpAddress,
        origin: customOrigin,
      } = await makeTestLocalServer(customConfig, testPort);

      const store = false;
      const userId = "customUserId";
      const metadata = {
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[0]]: "127.0.0.1",
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[1]]: "http://localhost:3000",
        notAllowedMetadataKey: "please REMOVE all fields in this scenario",
      };
      const expectedMetadata = {
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[0]]: "",
        [TEST_ALWAYS_ALLOWED_METADATA_KEYS[1]]: "",
        notAllowedMetadataKey: "",
      };
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        metadata,
        user: userId,
      };
      const stream = await makeClientAndRequest(
        requestBody,
        customOrigin,
        customIpAddress
      );

      const results = await expectValidResponses({ requestBody, stream });

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }

      expect(updatedConversation.storeMessageContent).toEqual(store);
      expectDefaultMessageContent({
        updatedConversation,
        userId,
        store,
        metadata: expectedMetadata,
      });

      customServer.close();
    });

    it("Should store function_call messages when `store: true`", async () => {
      const store = true;
      const functionCallName = "my_function";
      const functionCallArguments = `{"query": "value"}`;
      const functionCallOutputType = "function_call_output";
      const functionCallOutput = `{"result": "success"}`;
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        input: [
          {
            type: "function_call",
            call_id: "call123",
            name: functionCallName,
            arguments: functionCallArguments,
            status: "in_progress",
          },
          {
            type: functionCallOutputType,
            call_id: "call123",
            output: functionCallOutput,
            status: "completed",
          },
          {
            role: "user",
            content: "What is MongoDB?",
          },
        ],
      };
      const stream = await makeClientAndRequest(requestBody);

      const results = await expectValidResponses({ requestBody, stream });

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }
      const messages = updatedConversation.messages as Array<ToolMessage>;

      expect(updatedConversation.storeMessageContent).toEqual(store);

      expect(messages[0].role).toEqual("tool");
      expect(messages[0].name).toEqual(functionCallName);
      expect(messages[0].content).toEqual(functionCallArguments);

      expect(messages[1].role).toEqual("tool");
      expect(messages[1].name).toEqual(functionCallOutputType);
      expect(messages[1].content).toEqual(functionCallOutput);
    });

    it("Should not store function_call message content when `store: false`", async () => {
      const store = false;
      const functionCallName = "my_function";
      const functionCallOutputType = "function_call_output";
      const requestBody: Partial<CreateResponseRequest["body"]> = {
        store,
        input: [
          {
            type: "function_call",
            call_id: "call123",
            name: functionCallName,
            arguments: `{"query": "value"}`,
            status: "in_progress",
          },
          {
            type: functionCallOutputType,
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "completed",
          },
          {
            role: "user",
            content: "What is MongoDB?",
          },
        ],
      };
      const stream = await makeClientAndRequest(requestBody);

      const results = await expectValidResponses({ requestBody, stream });

      const updatedConversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      if (!updatedConversation) {
        return expect(updatedConversation).not.toBeNull();
      }
      const messages = updatedConversation.messages as Array<ToolMessage>;

      expect(updatedConversation.storeMessageContent).toEqual(store);

      expect(messages[0].role).toEqual("tool");
      expect(messages[0].name).toEqual(functionCallName);
      expect(messages[0].content).toEqual("");

      expect(messages[1].role).toEqual("tool");
      expect(messages[1].name).toEqual(functionCallOutputType);
      expect(messages[1].content).toEqual("");
    });
    it("should store conversation", async () => {
      const stream = await makeClientAndRequest({
        input: "What is MongoDB?",
      });

      const results: any[] = [];
      for await (const event of stream) {
        results.push(event);
      }
      const conversation = await conversations.findByMessageId({
        messageId: getMessageIdFromResults(results),
      });
      expect(conversation).not.toBeNull();
      expect(conversation?.messages.length).toBeGreaterThan(0);
      expect(conversation?.creationInterface).toBe(creationInterface);
    });
  });

  describe("Invalid requests", () => {
    it("Should return error responses if empty input string", async () => {
      const stream = await makeClientAndRequest({
        input: "",
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.input - ${CREATE_RESPONSE_ERR_MSG.INPUT_STRING}`,
      });
    });

    it("Should return error responses if empty message array", async () => {
      const stream = await makeClientAndRequest({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        input: [] as any,
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.input - ${CREATE_RESPONSE_ERR_MSG.INPUT_ARRAY}`,
      });
    });

    it("Should return error responses if model is not supported via config", async () => {
      const invalidModel = "invalid-model";
      const stream = await makeClientAndRequest({
        model: invalidModel,
      });

      await expectInvalidResponses({
        stream,
        message: CREATE_RESPONSE_ERR_MSG.MODEL_NOT_SUPPORTED(invalidModel),
      });
    });

    it("Should return error responses if max_output_tokens is > allowed limit", async () => {
      const max_output_tokens = 4001;
      const stream = await makeClientAndRequest({
        max_output_tokens,
      });

      await expectInvalidResponses({
        stream,
        message: CREATE_RESPONSE_ERR_MSG.MAX_OUTPUT_TOKENS(
          max_output_tokens,
          4000
        ),
      });
    });

    it("Should return error responses if metadata has too many fields", async () => {
      const metadata: Record<string, string> = {};
      for (let i = 0; i < 17; i++) {
        metadata[`key${i}`] = "value";
      }
      const stream = await makeClientAndRequest({
        metadata,
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.metadata - ${CREATE_RESPONSE_ERR_MSG.METADATA_LENGTH}`,
      });
    });

    it("Should return error responses if metadata value is too long", async () => {
      const stream = await makeClientAndRequest({
        metadata: { key1: "a".repeat(513) },
      });

      await expectInvalidResponses({
        stream,
        message:
          "Path: body.metadata.key1 - String must contain at most 512 character(s)",
      });
    });

    it("Should return error responses if temperature is not 0", async () => {
      const stream = await makeClientAndRequest({
        temperature: 0.5 as any,
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.temperature - ${CREATE_RESPONSE_ERR_MSG.TEMPERATURE}`,
      });
    });

    it("Should return error responses if instructions are too long", async () => {
      const stream = await makeClientAndRequest({
        instructions: "a".repeat(MAX_INSTRUCTIONS_LENGTH + 1),
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.instructions - ${CREATE_RESPONSE_ERR_MSG.INSTRUCTIONS_LENGTH}`,
      });
    });

    it("Should return error responses if string input is too long", async () => {
      const stream = await makeClientAndRequest({
        input: "a".repeat(MAX_INPUT_LENGTH + 1),
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.input - ${CREATE_RESPONSE_ERR_MSG.INPUT_LENGTH}`,
      });
    });

    it("Should return error responses if input array has too many items", async () => {
      const input = Array.from(
        { length: MAX_INPUT_ARRAY_LENGTH + 1 },
        (_, i) => ({
          type: "message" as const,
          role: "user" as const,
          content: `Message ${i}`,
        })
      );
      const stream = await makeClientAndRequest({
        input: input as any,
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.input - ${CREATE_RESPONSE_ERR_MSG.INPUT_ARRAY_LENGTH}`,
      });
    });

    it("Should return error responses if input array content is too long", async () => {
      const stream = await makeClientAndRequest({
        input: [
          {
            type: "message" as const,
            role: "user" as const,
            content: "a".repeat(MAX_INPUT_LENGTH + 1),
          },
        ],
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.input - ${CREATE_RESPONSE_ERR_MSG.INPUT_LENGTH}`,
      });
    });

    it("Should return error responses if tools array has too many items", async () => {
      const tools = Array.from({ length: MAX_TOOLS + 1 }, (_, i) => ({
        type: "function" as const,
        strict: true,
        name: `tool_${i}`,
        description: `Tool ${i}`,
        parameters: { type: "object", properties: {} },
      }));
      const stream = await makeClientAndRequest({
        tools,
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.tools - ${CREATE_RESPONSE_ERR_MSG.TOOLS_LENGTH}`,
      });
    });

    it("Should return error responses if tools content is too long", async () => {
      const tools = [
        {
          type: "function" as const,
          strict: true,
          name: "large_tool",
          description: "a".repeat(MAX_TOOLS_CONTENT_LENGTH),
          parameters: { type: "object", properties: {} },
        },
      ];
      const stream = await makeClientAndRequest({
        tools,
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.tools - ${CREATE_RESPONSE_ERR_MSG.TOOLS_CONTENT_LENGTH}`,
      });
    });

    it("Should return error responses if messages contain an invalid role", async () => {
      const stream = await makeClientAndRequest({
        input: [
          { role: "user", content: "What is MongoDB?" },
          {
            role: "invalid-role" as any,
            content: "This is an invalid role.",
          },
        ],
      });

      await expectInvalidResponses({
        stream,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return error responses if function_call has an invalid status", async () => {
      const stream = await makeClientAndRequest({
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

      await expectInvalidResponses({
        stream,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return error responses if function_call_output has an invalid status", async () => {
      const stream = await makeClientAndRequest({
        input: [
          {
            type: "function_call_output",
            call_id: "call123",
            output: `{"result": "success"}`,
            status: "invalid_status" as any,
          },
        ],
      });

      await expectInvalidResponses({
        stream,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return error responses with an invalid tool_choice string", async () => {
      const stream = await makeClientAndRequest({
        tool_choice: "invalid_choice" as any,
      });

      await expectInvalidResponses({
        stream,
        message: "Path: body.tool_choice - Invalid input",
      });
    });

    it("Should return error responses if max_output_tokens is negative", async () => {
      const stream = await makeClientAndRequest({
        max_output_tokens: -1,
      });

      await expectInvalidResponses({
        stream,
        message:
          "Path: body.max_output_tokens - Number must be greater than or equal to 0",
      });
    });

    it("Should return error responses if previous_response_id is not a valid ObjectId", async () => {
      const previous_response_id = "some-id";
      const stream = await makeClientAndRequest({
        previous_response_id,
      });

      await expectInvalidResponses({
        stream,
        message:
          CREATE_RESPONSE_ERR_MSG.INVALID_OBJECT_ID(previous_response_id),
      });
    });

    it("Should return error responses if previous_response_id is not found", async () => {
      const previous_response_id = "123456789012123456789012";
      const stream = await makeClientAndRequest({
        previous_response_id,
      });

      await expectInvalidResponses({
        stream,
        message:
          CREATE_RESPONSE_ERR_MSG.MESSAGE_NOT_FOUND(previous_response_id),
      });
    });

    it("Should return error responses if previous_response_id is not the latest message", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
        { role: "assistant", content: "Initial response!" },
        { role: "user", content: "Another message!" },
      ];
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages[0].id.toString();
      const stream = await makeClientAndRequest({
        previous_response_id,
      });

      await expectInvalidResponses({
        stream,
        message:
          CREATE_RESPONSE_ERR_MSG.MESSAGE_NOT_LATEST(previous_response_id),
      });
    });

    it("Should return error responses if there are too many messages in the conversation", async () => {
      const { maxUserMessagesInConversation } =
        appConfig.responsesRouterConfig.createResponse;

      const initialMessages = Array(maxUserMessagesInConversation).fill({
        role: "user",
        content: "Initial message!",
      });
      const { messages } = await conversations.create({ initialMessages });

      const previous_response_id = messages.at(-1)?.id.toString();
      const stream = await makeClientAndRequest({
        previous_response_id,
      });

      await expectInvalidResponses({
        stream,
        message: CREATE_RESPONSE_ERR_MSG.TOO_MANY_MESSAGES(
          maxUserMessagesInConversation
        ),
      });
    });

    it("Should return error responses if user id has changed since the conversation was created", async () => {
      const userId = "user1";
      const badUserId = "user2";

      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const { messages } = await conversations.create({
        userId,
        initialMessages,
      });

      const previous_response_id = messages.at(-1)?.id.toString();
      const stream = await makeClientAndRequest({
        previous_response_id,
        user: badUserId,
      });

      await expectInvalidResponses({
        stream,
        message: CREATE_RESPONSE_ERR_MSG.CONVERSATION_USER_ID_CHANGED,
      });
    });

    it("Should return error responses if `store: false` and `previous_response_id` is provided", async () => {
      const stream = await makeClientAndRequest({
        previous_response_id: "123456789012123456789012",
        store: false,
      });

      await expectInvalidResponses({
        stream,
        message: CREATE_RESPONSE_ERR_MSG.STORE_NOT_SUPPORTED,
      });
    });

    it("Should return error responses if `store: true` and `storeMessageContent: false`", async () => {
      const initialMessages: Array<SomeMessage> = [
        { role: "user", content: "Initial message!" },
      ];
      const { messages } = await conversations.create({
        storeMessageContent: false,
        initialMessages,
      });

      const previous_response_id = messages.at(-1)?.id.toString();
      const stream = await makeClientAndRequest({
        previous_response_id,
        store: true,
      });

      await expectInvalidResponses({
        stream,
        message: CREATE_RESPONSE_ERR_MSG.CONVERSATION_STORE_MISMATCH,
      });
    });

    it("Should return error responses if input content array has invalid type", async () => {
      const stream = await makeClientAndRequest({
        input: [
          {
            role: "user",
            content: [{ type: "input_image" as any, text: "What is MongoDB?" }],
          },
        ],
      });

      await expectInvalidResponses({
        stream,
        message: "Path: body.input - Invalid input",
      });
    });

    it("Should return error responses if input content array has more than one input_text element", async () => {
      const stream = await makeClientAndRequest({
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: "What is MongoDB?" },
              { type: "input_text", text: "Tell me more about it." },
            ],
          },
        ],
      });

      await expectInvalidResponses({
        stream,
        message: `Path: body.input[0].content - ${CREATE_RESPONSE_ERR_MSG.INPUT_TEXT_ARRAY}`,
      });
    });
  });
});

// --- HELPERS ---

const getMessageIdFromResults = (results?: Array<any>) => {
  if (!results?.length) throw new Error("No results found");

  const messageId = results.at(-1)?.response?.id;

  if (typeof messageId !== "string") throw new Error("Message ID not found");

  return new ObjectId(messageId);
};

interface ExpectInvalidResponsesParams {
  stream: Stream;
  message: string;
}

const expectInvalidResponses = async ({
  stream,
  message,
}: ExpectInvalidResponsesParams) => {
  const responses: any[] = [];
  try {
    for await (const event of stream) {
      responses.push(event);
    }

    fail("expected error");
  } catch (err: any) {
    expect(err.type).toBe(ERROR_TYPE);
    expect(err.code).toBe(ERROR_CODE.INVALID_REQUEST_ERROR);
    expect(err.error.type).toBe(ERROR_TYPE);
    expect(err.error.code).toBe(ERROR_CODE.INVALID_REQUEST_ERROR);
    expect(err.error.message).toBe(message);
  }

  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(0);
};

interface ExpectValidResponsesParams {
  stream: Stream;
  requestBody: Partial<CreateResponseRequest["body"]>;
}

const expectValidResponses = async ({
  stream,
  requestBody,
}: ExpectValidResponsesParams) => {
  const responses: any[] = [];
  for await (const event of stream) {
    responses.push(event);
  }

  expect(Array.isArray(responses)).toBe(true);
  expect(responses.length).toBe(6);

  expect(responses[0].type).toBe("response.created");
  expect(responses[1].type).toBe("response.in_progress");
  expect(responses[2].type).toBe("response.output_text.delta");
  expect(responses[3].type).toBe("response.output_text.annotation.added");
  expect(responses[4].type).toBe("response.output_text.done");
  expect(responses[5].type).toBe("response.completed");

  // skip mock events that don't have the extra data
  const skipIndexes = [2, 3, 4];

  responses.forEach(({ response, sequence_number }, index) => {
    if (skipIndexes.includes(index)) return;
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

  return responses;
};

interface ExpectDefaultMessageContentParams {
  initialMessages?: Array<SomeMessage>;
  updatedConversation: Conversation;
  store: boolean;
  userId?: string;
  metadata?: Record<string, string> | null;
}

const expectDefaultMessageContent = ({
  initialMessages,
  updatedConversation,
  store,
  userId,
  metadata = null,
}: ExpectDefaultMessageContentParams) => {
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
  expect(secondMessage.content).toBe(store ? "What is MongoDB?" : "");
  expect(secondMessage.metadata).toEqual(metadata);

  expect(thirdMessage.role).toEqual("assistant");
  expect(thirdMessage.content).toEqual(store ? "some content" : "");
  expect(thirdMessage.metadata).toEqual(metadata);
};
