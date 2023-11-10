import request from "supertest";
import "dotenv/config";
import {
  assertEnvVars,
  CORE_ENV_VARS,
  EmbeddedContent,
  MongoClient,
  Db,
  ObjectId,
} from "mongodb-rag-core";
import {
  conversationConstants,
  Conversation,
  ConversationsService,
  makeMongoDbConversationsService,
  AssistantMessage,
} from "../../services/conversations";
import express, { Express } from "express";
import {
  AddMessageRequestBody,
  addMessagesToDatabase,
  makeAddMessageToConversationRoute,
  convertDbMessageToOpenAiMessage,
  validateApiConversationFormatting,
  DEFAULT_MAX_INPUT_LENGTH,
  DEFAULT_MAX_MESSAGES_IN_CONVERSATION,
  includeChunksForMaxTokensPossible,
  makeDefaultReferenceLinks,
  AddMessageRequest,
} from "./addMessageToConversation";
import { ApiConversation, ApiMessage } from "./utils";
import { makeOpenAiChatLlm } from "../../services/openAiChatLlm";
import { makeDataStreamer } from "../../services/dataStreamer";
import { stripIndent } from "common-tags";
import { makeApp, DEFAULT_API_PREFIX, reqHandler } from "../../app";
import { makeTestApp } from "../../test/testHelpers";
import {
  makeTestAppConfig,
  generateUserPrompt,
  systemPrompt,
} from "../../test/testHelpers";
import { AppConfig } from "../../app";
import { AzureKeyCredential, OpenAIClient } from "@azure/openai";
import { makeDefaultFindContentFunc } from "./FindContentFunc";
import { embedder, embeddedContentStore as store } from "../../test/testConfig";
import { requireRequestOrigin } from "../../middleware/requestOrigin";
import validateRequestSchema from "../../middleware/validateRequestSchema";

const { OPENAI_CHAT_COMPLETION_DEPLOYMENT, OPENAI_ENDPOINT } =
  assertEnvVars(CORE_ENV_VARS);
jest.setTimeout(100000);
describe("POST /conversations/:conversationId/messages", () => {
  let mongodb: Db;
  let mongoClient: MongoClient;
  let ipAddress: string;
  let origin: string;
  let dataStreamer: ReturnType<typeof makeDataStreamer>;
  let conversations: ConversationsService;
  let app: Express;
  let appConfig: AppConfig;

  beforeAll(async () => {
    ({ ipAddress, origin, mongodb, app, appConfig, mongoClient } =
      await makeTestApp());
    ({
      conversationsRouterConfig: { dataStreamer, conversations },
    } = appConfig);
  });

  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
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
          "how can i use mongodb products to help me build my new mobile app?",
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

    it("should respond 400 if the Origin header is missing", async () => {
      const res: request.Response = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .send({ message: "howdy there" });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toEqual({ error: "No Origin header" });
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
      const { _id } = await conversations.create({
        ipAddress,
      });
      // Init conversation with max length
      for await (const i of Array(DEFAULT_MAX_MESSAGES_IN_CONVERSATION - 1)) {
        const role = i % 2 === 0 ? "user" : "assistant";
        if (role === "assistant") {
          await conversations.addConversationMessage({
            conversationId: _id,
            content: `message ${i}`,
            role,
            references: [],
          });
        } else {
          await conversations.addConversationMessage({
            conversationId: _id,
            content: `message ${i}`,
            role,
            embedding: [1, 2, 3],
            requestOrigin: origin,
          });
        }
      }

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", _id.toString()))
        .set("X-Forwarded-For", ipAddress) // different IP address
        .set("Origin", origin)
        .send({
          message: "hello",
        });
      expect(res.statusCode).toEqual(400);
      expect(res.body).toStrictEqual({
        error:
          "Too many messages. You cannot send more than 6 messages in this conversation.",
      });
    });

    test("should respond 500 if error with findContent func", async () => {
      const app = await makeApp({
        ...appConfig,
        conversationsRouterConfig: {
          ...appConfig.conversationsRouterConfig,
          findContent() {
            throw new Error("Broken!");
          },
        },
      });

      const res = await request(app)
        .post(endpointUrl.replace(":conversationId", conversationId))
        .set("X-FORWARDED-FOR", ipAddress)
        .set("Origin", origin)
        .send({ message: "hello" });
      expect(res.statusCode).toEqual(500);
      expect(res.body).toStrictEqual({
        error: "Broken!",
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
        async findById() {
          throw new Error("Error finding conversation");
        },
        async rateMessage() {
          throw new Error("mock error");
        },
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
        conversationConstants.NO_RELEVANT_CONTENT
      );
    });
    test("Should respond with 200 and static response if no vector search content for user message", async () => {
      // Lorem ipsum in Burmese (apparently), if you're curious what this is. Thanks ChatGPT.
      const nonsenseMessage =
        "အဘယ်သူမျှမက အပြင်အဆင်မရှိတဲ့ အကြောင်းအရာကို အချစ်လုပ်တယ်လို့ စဉ်းစားသွားတယ်၊ အဲ့အကြောင်းအရာကို ရယူလိုတယ်လို့ စဉ်းစားသွားတယ်၊ အဲ့အကြောင်းအရာသည် အပြင်အဆင်မရှိတဲ့ အကြောင်းအရာဖြစ်တဲ့အတွက် ဖြစ်နေတယ်ဆိုရင်တောင်း အဲ့နောက်ပိုင်း အားလုံးသည် အရှေ့တန်ဖိုးရှိသော အပျင်းအဆင်ကို ရယူနိုင်သည်။";
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
        conversationConstants.NO_RELEVANT_CONTENT
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
        systemPrompt,
        openAiLmmConfigOptions: {
          temperature: 0,
          maxTokens: 500,
        },
        generateUserPrompt,
      });

      let conversationId: ObjectId,
        conversations: ConversationsService,
        app: Express;
      let testMongo: Db;
      let testMongoClient: MongoClient;
      beforeEach(async () => {
        const { mongodb, mongoClient } = makeTestAppConfig();
        testMongo = mongodb;
        testMongoClient = mongoClient;

        conversations = makeMongoDbConversationsService(
          testMongo,
          systemPrompt
        );
        const { _id } = await conversations.create({
          ipAddress,
        });
        conversationId = _id;

        const findContent = makeDefaultFindContentFunc({
          embedder,
          store,
        });
        app = express();
        app.use(express.json());
        app.use(reqHandler);
        app.post(
          endpointUrl,
          requireRequestOrigin(),
          validateRequestSchema(AddMessageRequest),
          makeAddMessageToConversationRoute({
            conversations,
            llm: brokenLlmService,
            dataStreamer,
            findContent,
          })
        );
      });
      afterEach(async () => {
        await testMongo.dropDatabase();
        await testMongoClient.close();
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
        expect(
          response.body.content.startsWith(
            conversationConstants.LLM_NOT_WORKING
          )
        ).toBe(true);
        expect(response.body.references.length).toBeGreaterThan(0);
      });
    });
  });
  describe("Utility functions", () => {
    describe("addMessagesToDatabase()", () => {
      let conversationId: ObjectId;
      beforeAll(async () => {
        const { _id } = await conversations.create({
          ipAddress,
        });
        conversationId = _id;
      });
      test("Should add messages to the database", async () => {
        const userMessageContent = "hello";
        const assistantMessageContent = "hi";
        const { userMessage, assistantMessage } = await addMessagesToDatabase({
          conversation: {
            _id: conversationId,
            ipAddress,
            createdAt: new Date(),
            messages: [],
          },
          originalUserMessageContent: userMessageContent,
          assistantMessageContent,
          assistantMessageReferences: [
            { url: "https://www.example.com/", title: "Example Reference" },
          ],
          conversations,
          requestOrigin: origin,
          userMessageEmbedding: [1, 2, 3],
        });
        expect(userMessage.content).toBe(userMessageContent);
        expect(assistantMessage.content).toBe(assistantMessageContent);
        const conversationInDb = await conversations.findById({
          _id: conversationId,
        });
        expect(
          conversationInDb?.messages.find(
            ({
              role,
              content,
            }: {
              role: "system" | "user" | "assistant";
              content: string;
            }) => role === "user" && content === userMessageContent
          )
        ).toBeDefined();
        expect(
          conversationInDb?.messages.find(
            ({
              role,
              content,
            }: {
              role: "system" | "user" | "assistant";
              content: string;
            }) => role === "assistant" && content === assistantMessageContent
          )
        ).toBeDefined();
      });
    });
    test("convertDbMessageToOpenAiMessage()", () => {
      const sampleDbMessage: AssistantMessage = {
        id: new ObjectId(),
        content: "hello",
        role: "assistant",
        createdAt: new Date(),
        rating: true,
        references: [],
      };

      const sampleApiMessage = convertDbMessageToOpenAiMessage(sampleDbMessage);
      expect(sampleApiMessage).toStrictEqual({
        content: sampleDbMessage.content,
        role: sampleDbMessage.role,
      });
    });

    describe("default find content", () => {
      const findContent = makeDefaultFindContentFunc({
        embedder,
        store,
      });
      test("Should return content for relevant text", async () => {
        const query = "MongoDB Atlas";
        const { content } = await findContent({
          query,
          ipAddress,
        });
        expect(content).toBeDefined();
        expect(content.length).toBeGreaterThan(0);
      });
      test("Should not return content for irrelevant text", async () => {
        const query =
          "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
        const { content } = await findContent({
          query,
          ipAddress,
        });
        expect(content).toBeDefined();
        expect(content.length).toBe(0);
      });
    });
    describe("generateReferences()", () => {
      // Chunk 1 and 2 are the same page. Chunk 3 is a different page.
      const chunk1 = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/",
        text: "blah blah blah",
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      const chunk2 = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/",
        text: "blah blah blah",
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      const chunk3 = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/xyz",
        text: "blah blah blah",
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      const chunkWithTitle = {
        _id: new ObjectId(),
        url: "https://mongodb.com/docs/realm/sdk/node/xyz",
        text: "blah blah blah",
        metadata: {
          pageTitle: "title",
        },
        tokenCount: 100,
        embedding: [0.1, 0.2, 0.3],
        updated: new Date(),
        sourceName: "realm",
      };
      test("No sources should return empty string", () => {
        const noChunks: EmbeddedContent[] = [];
        const noReferences = makeDefaultReferenceLinks(noChunks);
        expect(noReferences).toEqual([]);
      });
      test("One source should return one link", () => {
        const oneChunk: EmbeddedContent[] = [chunk1];
        const oneReference = makeDefaultReferenceLinks(oneChunk);
        const expectedOneReference = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/",
          },
        ];
        expect(oneReference).toEqual(expectedOneReference);
      });
      test("Chunk with title should return title in reference", () => {
        const oneChunk: EmbeddedContent[] = [chunkWithTitle];
        const oneReference = makeDefaultReferenceLinks(oneChunk);
        const expectedOneReference = [
          {
            title: "title",
            url: "https://mongodb.com/docs/realm/sdk/node/xyz",
          },
        ];
        expect(oneReference).toEqual(expectedOneReference);
      });
      test("Multiple sources from same page should return one link", () => {
        const twoChunksSamePage: EmbeddedContent[] = [chunk1, chunk2];
        const oneReferenceSamePage =
          makeDefaultReferenceLinks(twoChunksSamePage);
        const expectedOneReferenceSamePage = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/",
          },
        ];
        expect(oneReferenceSamePage).toEqual(expectedOneReferenceSamePage);
      });
      test("Multiple sources from different pages should return 1 link per page", () => {
        const twoChunksDifferentPage: EmbeddedContent[] = [chunk1, chunk3];
        const multipleReferencesDifferentPage = makeDefaultReferenceLinks(
          twoChunksDifferentPage
        );
        const expectedMultipleReferencesDifferentPage = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/",
          },
          {
            title: "https://mongodb.com/docs/realm/sdk/node/xyz",
            url: "https://mongodb.com/docs/realm/sdk/node/xyz",
          },
        ];
        expect(multipleReferencesDifferentPage).toEqual(
          expectedMultipleReferencesDifferentPage
        );
        // All three sources. Two from the same page. One from a different page.
        const threeChunks: EmbeddedContent[] = [chunk1, chunk2, chunk3];
        const multipleSourcesWithSomePageOverlap =
          makeDefaultReferenceLinks(threeChunks);
        const expectedMultipleSourcesWithSomePageOverlap = [
          {
            title: "https://mongodb.com/docs/realm/sdk/node/",
            url: "https://mongodb.com/docs/realm/sdk/node/",
          },
          {
            title: "https://mongodb.com/docs/realm/sdk/node/xyz",
            url: "https://mongodb.com/docs/realm/sdk/node/xyz",
          },
        ];
        expect(multipleSourcesWithSomePageOverlap).toEqual(
          expectedMultipleSourcesWithSomePageOverlap
        );
      });
    });
    describe("includeChunksForMaxTokensPossible()", () => {
      const content: EmbeddedContent[] = [
        {
          url: "https://mongodb.com/docs/realm/sdk/node/",
          text: "foo foo foo",
          tokenCount: 100,
          embedding: [0.1, 0.2, 0.3],
          sourceName: "realm",
          updated: new Date(),
        },
        {
          url: "https://mongodb.com/docs/realm/sdk/node/",
          text: "bar bar bar",
          tokenCount: 100,
          embedding: [0.1, 0.2, 0.3],
          sourceName: "realm",
          updated: new Date(),
        },
        {
          url: "https://mongodb.com/docs/realm/sdk/node/",
          text: "baz baz baz",
          tokenCount: 100,
          embedding: [0.1, 0.2, 0.3],
          sourceName: "realm",
          updated: new Date(),
        },
      ];
      test("Should include all chunks if less that max tokens", () => {
        const maxTokens = 1000;
        const includedChunks = includeChunksForMaxTokensPossible({
          content,
          maxTokens,
        });
        expect(includedChunks).toStrictEqual(content);
      });
      test("should only include subset of chunks that fit within max tokens, inclusive", () => {
        const maxTokens = 200;
        const includedChunks = includeChunksForMaxTokensPossible({
          content,
          maxTokens,
        });
        expect(includedChunks).toStrictEqual(content.slice(0, 2));
        const maxTokens2 = maxTokens + 1;
        const includedChunks2 = includeChunksForMaxTokensPossible({
          content,
          maxTokens: maxTokens2,
        });
        expect(includedChunks2).toStrictEqual(content.slice(0, 2));
      });
    });
    describe("validateApiConversationFormatting()", () => {
      test("Should validate correctly formatted conversation", () => {
        const correctlyFormattedConversation: ApiConversation = {
          _id: new ObjectId().toHexString(),
          messages: [
            {
              content: "hi",
              role: "assistant",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
            {
              content: "hello",
              role: "user",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
            {
              content: "bye",
              role: "assistant",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
            {
              content: "good bye",
              role: "user",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
          ],
          createdAt: Date.now(),
        };
        const validation = validateApiConversationFormatting({
          conversation: correctlyFormattedConversation,
        });
        expect(validation).toBe(true);
      });
      test("Should not validate empty conversation", () => {
        const emptyConversation: ApiConversation = {
          _id: new ObjectId().toHexString(),
          messages: [],
          createdAt: Date.now(),
        };
        const validation = validateApiConversationFormatting({
          conversation: emptyConversation,
        });
        expect(validation).toBe(false);
      });
      test("Should not validate odd number of messages", () => {
        const oddNumberOfMessages: ApiConversation = {
          _id: new ObjectId().toHexString(),
          messages: [
            {
              content: "hi",
              role: "assistant",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
            {
              content: "hello",
              role: "user",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
            {
              content: "bye",
              role: "assistant",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
          ],
          createdAt: Date.now(),
        };
        const validation = validateApiConversationFormatting({
          conversation: oddNumberOfMessages,
        });
        expect(validation).toBe(false);
      });
      test("Should not validate incorrect conversation order", () => {
        const incorrectConversationOrder: ApiConversation = {
          _id: new ObjectId().toHexString(),
          messages: [
            {
              content: "hi",
              role: "assistant",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
            {
              content: "bye",
              role: "assistant",
              createdAt: Date.now(),
              id: new ObjectId().toHexString(),
            },
          ],
          createdAt: Date.now(),
        };
        const validation = validateApiConversationFormatting({
          conversation: incorrectConversationOrder,
        });
        expect(validation).toBe(false);
      });
    });
  });
});
