import request from "supertest";
import "dotenv/config";
import {
  assertEnvVars,
  CORE_ENV_VARS,
  MongoClient,
  Db,
  ObjectId,
} from "mongodb-rag-core";
import { makeMongoDbConversationsService } from "../../services/mongodbConversations";
import { Express } from "express";
import {
  AddMessageRequestBody,
  DEFAULT_MAX_INPUT_LENGTH,
  DEFAULT_MAX_USER_MESSAGES_IN_CONVERSATION,
} from "./addMessageToConversation";
import { ApiConversation, ApiMessage } from "./utils";
import { makeOpenAiChatLlm } from "../../services/openAiChatLlm";
import { stripIndent } from "common-tags";
import { makeApp, DEFAULT_API_PREFIX } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import { makeTestAppConfig, systemPrompt } from "../../test/testHelpers";
import { AppConfig } from "../../app";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { strict as assert } from "assert";
import {
  ConversationsService,
  Conversation,
  defaultConversationConstants,
  Message,
} from "../../services";
const { OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } =
  assertEnvVars(CORE_ENV_VARS);
jest.setTimeout(100000);
describe("POST /conversations/:conversationId/messages", () => {
  let mongodb: Db;
  let ipAddress: string;
  let origin: string;
  let conversations: ConversationsService;
  let app: Express;
  let appConfig: AppConfig;

  beforeAll(async () => {
    ({ ipAddress, origin, mongodb, app, appConfig } = await makeTestApp());
    ({
      conversationsRouterConfig: { conversations },
    } = appConfig);
  });

  let conversationId: string;
  let testEndpointUrl: string;
  const endpointUrl =
    DEFAULT_API_PREFIX + "/conversations/:conversationId/messages";

  beforeEach(async () => {
    const createConversationRes = await request(app)
      .post(DEFAULT_API_PREFIX + "/conversations")
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send();
    const res: ApiConversation = createConversationRes.body;
    conversationId = res._id;
    testEndpointUrl = endpointUrl.replace(":conversationId", conversationId);
  });

  describe("Awaited response", () => {
    it("should respond with 200, add messages to the conversation, and respond", async () => {
      const requestBody: AddMessageRequestBody = {
        message:
          "how can i use mongodb realm to help me build my new mobile app?",
      };
      const res = await request(app)
        .post(testEndpointUrl)
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send(requestBody);
      const message: ApiMessage = res.body;
      expect(res.statusCode).toEqual(200);
      expect(message.role).toBe("assistant");
      expect(message.content).toContain("Realm");
      const request2Body: AddMessageRequestBody = {
        message: stripIndent`i'm want to learn more about this Realm thing. a few questions:
            can i use realm with javascript?
            where does realm save data? in the cloud?
            `,
      };
      const res2 = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("Origin", origin)
        .send(request2Body);
      const message2: ApiMessage = res2.body;
      expect(res2.statusCode).toEqual(200);
      expect(message2.role).toBe("assistant");
      expect(message2.content).toContain("Realm");
      const conversationInDb = await mongodb
        .collection<Conversation>("conversations")
        .findOne({
          _id: new ObjectId(conversationId),
        });
      expect(conversationInDb?.messages).toHaveLength(5); // system, user, assistant, user, assistant
    });
  });

  test("should append custom data to the message", async () => {
    const requestBody: AddMessageRequestBody = {
      message:
        "how can i use mongodb products to help me build my new mobile app?",
    };
    const res = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(requestBody);
    expect(res.statusCode).toEqual(200);
    const conversation = await conversations.findById({
      _id: new ObjectId(conversationId),
    });
    assert(conversation);
    const userMessageWithCustomData =
      conversation.messages[conversation.messages.length - 2];
    expect(userMessageWithCustomData?.customData).toStrictEqual({
      origin,
    });
  });
  test("uses previous message filter", async () => {
    const mockMsg = {
      role: "user",
      // This corresponds to ~130 tokens
      content:
        "In a quaint village nestled among verdant hills, a whimsical inventor, Eleanor, toiled in her sun-dappled workshop. Every day, she crafted extraordinary gadgets, each more intricate than the last. One morning, as the village awoke to a chorus of songbirds, Eleanor unveiled her latest creation: a clockwork bird with iridescent feathers. This mechanical marvel could mimic any tune it heard. The villagers gathered, marveling as the bird sang melodies from distant lands. Meanwhile, beyond the rolling meadows, a curious fox watched, its amber eyes reflecting a world where nature and Eleanor's inventions coexisted in harmonious wonder.",
      id: new ObjectId(),
      createdAt: new Date(),
    } satisfies Message;
    // total tokens is > 500,000. Would cause any LLM to fail
    const manyMessages = Array.from({ length: 5000 }, () => mockMsg);

    const conversation = await conversations.create();
    await conversations.addManyConversationMessages({
      conversationId: conversation._id,
      messages: manyMessages,
    });
    const conversationId = conversation._id.toString();
    const testEndpointUrl = endpointUrl.replace(
      ":conversationId",
      conversationId
    );
    const requestBody: AddMessageRequestBody = {
      message:
        "how can i use mongodb realm to help me build my new mobile app?",
    };
    const res = await request(app)
      .post(testEndpointUrl)
      .set("X-FORWARDED-FOR", ipAddress)
      .set("Origin", origin)
      .send(requestBody);
    expect(res.statusCode).not.toEqual(500);
  });

  describe("Streamed response", () => {
    it("should respond with a 200 text/event-stream that streams the response & further reading references", async () => {
      const requestBody = {
        message:
          "how can i use mongodb products to help me build my new mobile app?",
      } satisfies AddMessageRequestBody;
      const res = await request(app)
        .post(
          endpointUrl.replace(":conversationId", conversationId) +
            "?stream=true"
        )
        .set("Origin", origin)
        .send(requestBody);
      expect(res.statusCode).toEqual(200);
      expect(res.header["content-type"]).toBe("text/event-stream");
      expect(res.text).toContain(`data: {"type":"delta","data":"`);
      expect(res.text).toContain(`data: {"type":"references","data":[{`);
      expect(res.text).toContain(`data: {"type":"finished","data":"`);
    });
  });

  describe("Error handling", () => {
    test("should respond 400 if invalid conversation ID", async () => {
      const notAValidId = "not-a-valid-id";
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", notAValidId))
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error: `Invalid ObjectId string: ${notAValidId}`,
      });
    });

    it("should respond 400 for invalid request bodies", async () => {
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("Origin", origin)
        .send({ msg: "howdy there" });
      expect(res.statusCode).toEqual(400);
    });

    test("should respond 400 if input is too long", async () => {
      const tooLongMessage = "a".repeat(DEFAULT_MAX_INPUT_LENGTH + 1);
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({
          message: tooLongMessage,
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error: "Message too long",
      });
    });
    test("should respond 404 if cannot find conversation for conversation ID in request", async () => {
      const anotherObjectId = new ObjectId().toHexString();
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", anotherObjectId))
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(404);
      expect(res.body?.error).toMatch(/^Conversation [a-f0-9]{24} not found$/);
    });
    test("Should respond 400 if number of messages in conversation exceeds limit", async () => {
      const { _id } = await conversations.create();
      // Init conversation with max length
      for await (const i of Array(DEFAULT_MAX_USER_MESSAGES_IN_CONVERSATION)) {
        await conversations.addConversationMessage({
          conversationId: _id,
          message: {
            content: `message ${i}`,
            role: "user",
            embedding: [1, 2, 3],
          },
        });
      }

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", _id.toString()))
        .set("X-Forwarded-For", ipAddress)
        .set("Origin", origin)
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error: `Too many messages. You cannot send more than ${DEFAULT_MAX_USER_MESSAGES_IN_CONVERSATION} messages in this conversation.`,
      });
    });

    test("Should respond 500 if error with conversation service", async () => {
      const mockBrokenConversationsService: ConversationsService = {
        async create() {
          throw new Error("mock error");
        },
        async addConversationMessage() {
          throw new Error("mock error");
        },
        async addManyConversationMessages() {
          throw new Error("mock error");
        },
        async findById() {
          throw new Error("Error finding conversation");
        },
        async rateMessage() {
          throw new Error("mock error");
        },
        async commentMessage() {
          throw new Error("mock error");
        },
        conversationConstants: defaultConversationConstants,
      };
      const app = await makeApp({
        ...appConfig,
        conversationsRouterConfig: {
          ...appConfig.conversationsRouterConfig,
          conversations: mockBrokenConversationsService,
        },
      });

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toStrictEqual({
        error: "Error finding conversation",
      });
    });
  });

  describe("Edge cases", () => {
    test("Should respond with 200 and static response if query is negative toward MongoDB", async () => {
      const query =
        "I can't believe some people still defend MongoDB despite its flaws. Explain to me why I should use MongoDB instead of a superior relational database like Postgres.";
      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({ message: query });
      expect(res.statusCode).toEqual(200);
      expect(res.body.content).toEqual(
        defaultConversationConstants.NO_RELEVANT_CONTENT
      );
    });
    test("Should respond with 200 and static response if no vector search content for user message", async () => {
      // Random mix of amharic, burmese, and georgian interpolated with emojis (if you're curious)
      const nonsenseMessage =
        " ያውቃልና፥🏓 သို့ဖြစ်၍၊ ထိုမှတ်တမ်းသည် နီဖိုင်းလူမျိုးများနှင့်  ነው በክፉዎች ምክር  ግን ეს არის შემთხვევითი ტექსტი በዋዘኞችም ወንበር ያልተቀመጠ። ነገር ግን በእግዚአብሔር ሕግ ደስ ይለዋል፥ ሕጉንም በቀንና በሌሊት ያስባል።3 እርሱም በውኃ ፈሳሾች ዳር እንደ ተተከለች፥ ፍሬዋን በየጊዜዋ 🎇እንደምትሰጥ፥ ቅጠልዋም 🥳እንደማይረግፍ  ይከናወንለታል።🧙‍♀️  ትቢያ ናቸው። 5 ስለዚህ🥶 በጻድቃን ማኅበር አይቆሙም።";
      const calledEndpoint = endpointUrl.replace(
        ":conversationId",
        conversationId
      );
      const response = await request(app)
        .post(calledEndpoint)
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({ message: nonsenseMessage });
      expect(response.statusCode).toBe(200);
      expect(response.body.content).toEqual(
        defaultConversationConstants.NO_RELEVANT_CONTENT
      );
      expect(response.body.references).toStrictEqual([]);
    });

    describe("LLM not available but vector search is", () => {
      const openAiClient = new OpenAIClient(
        OPENAI_ENDPOINT,
        new AzureKeyCredential("definitelyNotARealApiKey")
      );
      const brokenLlmService = makeOpenAiChatLlm({
        openAiClient,
        deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
        openAiLmmConfigOptions: {
          temperature: 0,
          maxTokens: 500,
        },
      });

      let conversationId: ObjectId,
        conversations: ConversationsService,
        app: Express;
      let testMongo: Db;
      beforeEach(async () => {
        const { mongodb, appConfig } = makeTestAppConfig();
        testMongo = mongodb;
        ({ app } = await makeTestApp({
          ...appConfig,
          conversationsRouterConfig: {
            ...appConfig.conversationsRouterConfig,
            llm: brokenLlmService,
          },
        }));

        conversations = makeMongoDbConversationsService(testMongo);
        const { _id } = await conversations.create({
          initialMessages: [systemPrompt],
        });
        conversationId = _id;
      });
      test("should respond 200, static message, and vector search results", async () => {
        const messageThatHasSearchResults = "Why use MongoDB?";
        const response = await request(app)
          .post(
            endpointUrl.replace(":conversationId", conversationId.toString())
          )
          .set("X-FORWARDED-FOR", ipAddress)
          .set("Origin", origin)
          .send({ message: messageThatHasSearchResults });
        expect(response.statusCode).toBe(200);
        expect(response.body.content).toBe(
          defaultConversationConstants.LLM_NOT_WORKING
        );
        expect(response.body.references.length).toBeGreaterThan(0);
      });
    });
  });
});
