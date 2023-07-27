import { strict as assert } from "assert";
import request from "supertest";
import "dotenv/config";
import {
  MongoDB,
  makeOpenAiEmbedFunc,
  assertEnvVars,
  CORE_ENV_VARS,
  EmbeddedContentStore,
  EmbeddedContent,
  makeDatabaseConnection,
  EmbedFunc,
  FindNearestNeighborsOptions,
} from "chat-core";
import {
  conversationConstants,
  Conversation,
  ConversationsService,
  Message,
  ConversationsServiceInterface,
} from "../../services/conversations";
import express, { Express } from "express";
import {
  AddMessageRequestBody,
  addMessagesToDatabase,
  makeAddMessageToConversationRoute,
  convertDbMessageToOpenAiMessage,
  generateFurtherReading,
  validateApiConversationFormatting,
  getContentForText,
  MAX_INPUT_LENGTH,
  AddMessageToConversationRouteParams,
  MAX_MESSAGES_IN_CONVERSATION,
} from "./addMessageToConversation";
import { ApiConversation, ApiMessage } from "./utils";
import { makeOpenAiLlm } from "../../services/llm";
import { makeDataStreamer } from "../../services/dataStreamer";
import { stripIndent } from "common-tags";
import { ObjectId } from "mongodb";
import { makeApp } from "../../app";

jest.setTimeout(100000);

// ip address for local host
const ipAddress = "127.0.0.1";

describe("Conversations Router", () => {
  const {
    MONGODB_CONNECTION_URI,
    MONGODB_DATABASE_NAME,
    OPENAI_ENDPOINT,
    OPENAI_API_KEY,
    OPENAI_EMBEDDING_DEPLOYMENT,
    OPENAI_EMBEDDING_MODEL_VERSION,
    OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    VECTOR_SEARCH_INDEX_NAME,
  } = assertEnvVars(CORE_ENV_VARS);

  // set up embeddings service
  const embed = makeOpenAiEmbedFunc({
    apiKey: OPENAI_API_KEY,
    apiVersion: OPENAI_EMBEDDING_MODEL_VERSION,
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_EMBEDDING_DEPLOYMENT,
  });

  // set up llm service
  const llm = makeOpenAiLlm({
    baseUrl: OPENAI_ENDPOINT,
    deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
    apiKey: OPENAI_API_KEY,
  });
  const dataStreamer = makeDataStreamer();

  const findNearestNeighborsOptions: FindNearestNeighborsOptions = {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  };

  const testDbName = `conversations-test-${Date.now()}`;
  const mongodb = new MongoDB(MONGODB_CONNECTION_URI, testDbName);

  let defaultRouteConfig: AddMessageToConversationRouteParams;
  let app: Express;
  let store: EmbeddedContentStore;
  let conversations: ConversationsServiceInterface;

  beforeAll(async () => {
    store = await makeDatabaseConnection({
      connectionUri: MONGODB_CONNECTION_URI,
      databaseName: MONGODB_DATABASE_NAME,
    });
    conversations = new ConversationsService(mongodb.db);

    defaultRouteConfig = {
      conversations,
      dataStreamer,
      embed,
      findNearestNeighborsOptions,
      llm,
      store,
    };

    app = await makeApp(defaultRouteConfig);
  });

  afterAll(async () => {
    await mongodb?.db.dropDatabase();
    await mongodb?.close();
  });

  // create route with mock service
  describe("POST /conversations", () => {
    it("should respond with 200 and create a conversation", async () => {
      const res = await request(app).post("/conversations/").send();
      const conversation: ApiConversation = res.body;
      expect(res.statusCode).toEqual(200);

      expect(conversation.messages).toHaveLength(0);
      const count = await mongodb?.db
        .collection<Conversation>("conversations")
        .countDocuments();
      expect(count).toBe(1);
    });
  });

  describe("POST /conversations/:conversationId/messages", () => {
    const endpointUrl = "/conversations/:conversationId/messages";
    let conversationId: string;
    let testEndpointUrl: string;

    beforeEach(async () => {
      const createConversationRes = await request(app)
        .post("/conversations")
        .set("X-FORWARDED-FOR", ipAddress)
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
          .send(request2Body);
        const message2: ApiMessage = res2.body;
        expect(res2.statusCode).toEqual(200);
        expect(message2.role).toBe("assistant");
        expect(message2.content).toContain("Realm");
        const conversationInDb = await mongodb?.db
          .collection<Conversation>("conversations")
          .findOne({
            _id: new ObjectId(conversationId),
          });
        expect(conversationInDb?.messages).toHaveLength(5); // system, user, assistant, user, assistant
      });
    });

    describe("Streamed response", () => {
      it("should respond with a 200 text/event-stream that streams the response", async () => {
        const requestBody = {
          message:
            "how can i use mongodb products to help me build my new mobile app?",
        } satisfies AddMessageRequestBody;
        const res = await request(app)
          .post(
            endpointUrl.replace(":conversationId", conversationId) +
              "?stream=true"
          )
          .send(requestBody);
        expect(res.statusCode).toEqual(200);
        expect(res.header["content-type"]).toBe("text/event-stream");
        expect(res.text).toContain(`data: {"type":"delta","data":"`);
        expect(res.text).toContain(`data: {"type":"finished","data":"`);
      });
    });

    describe("Error handing", () => {
      test("should respond 400 if invalid conversation ID", async () => {
        const notAValidId = "not-a-valid-id";
        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", notAValidId))
          .set("X-FORWARDED-FOR", ipAddress)
          .send({
            message: "hello",
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toStrictEqual({
          error: "Invalid conversation ID",
        });
      });

      it("should return 400 for invalid request bodies", async () => {
        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", conversationId))
          .send({ msg: "howdy there" });
        expect(res.statusCode).toEqual(400);
      });

      test("should respond 400 if input is too long", async () => {
        const tooLongMessage = "a".repeat(MAX_INPUT_LENGTH + 1);
        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", conversationId))
          .set("X-FORWARDED-FOR", ipAddress)
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
          .send({
            message: "hello",
          });
        expect(res.statusCode).toEqual(404);
        expect(res.body).toStrictEqual({
          error: "Conversation not found",
        });
      });
      test("should return 403 if IP address in request doesn't match IP address in conversation", async () => {
        // TODO: this is done in DOCSP-30843
      });
      test("Should return 400 if number of messages in conversation exceeds limit", async () => {
        const { _id } = await conversations.create({
          ipAddress,
        });
        // Init conversation with max length
        for await (const i of Array(MAX_MESSAGES_IN_CONVERSATION - 1)) {
          const role = i % 2 === 0 ? "user" : "assistant";
          await conversations.addConversationMessage({
            conversationId: _id,
            content: `message ${i}`,
            role,
          });
        }

        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", _id.toString()))
          .set("X-Forwarded-For", ipAddress) // different IP address
          .send({
            message: "hello",
          });
        expect(res.statusCode).toEqual(400);
        expect(res.body).toStrictEqual({
          error:
            `You cannot send more messages to this conversation. ` +
            `Max messages (${MAX_MESSAGES_IN_CONVERSATION}, including system prompt) exceeded. ` +
            `Start a new conversation.`,
        });
      });

      test("should respond 500 if error with embed service", async () => {
        const mockBrokenEmbedFunc: EmbedFunc = jest.fn();
        const app = await makeApp({
          ...defaultRouteConfig,
          embed: mockBrokenEmbedFunc,
        });

        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", conversationId))
          .set("X-FORWARDED-FOR", ipAddress)
          .send({ message: "hello" });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toStrictEqual({
          error: "Error getting content for text",
        });
      });

      test("Should respond 500 if error with conversation service", async () => {
        const mockBrokenConversationsService: ConversationsServiceInterface = {
          async create() {
            throw new Error("mock error");
          },
          async addConversationMessage() {
            throw new Error("mock error");
          },
          async findById() {
            throw new Error("mock error");
          },
          async rateMessage() {
            throw new Error("mock error");
          },
        };
        const app = await makeApp({
          ...defaultRouteConfig,
          conversations: mockBrokenConversationsService,
        });

        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", conversationId))
          .set("X-FORWARDED-FOR", ipAddress)
          .send({ message: "hello" });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toStrictEqual({
          error: "Error finding conversation",
        });
      });

      test("should respond 500 if error with content service", async () => {
        const brokenStore: EmbeddedContentStore = {
          loadEmbeddedContent: jest.fn().mockResolvedValue(undefined),
          deleteEmbeddedContent: jest.fn().mockResolvedValue(undefined),
          updateEmbeddedContent: jest.fn().mockResolvedValue(undefined),
          findNearestNeighbors: () => {
            throw new Error("mock error");
          },
        };
        const app = await makeApp({
          ...defaultRouteConfig,
          store: brokenStore,
        });

        const res = await request(app)
          .post(endpointUrl.replace(":conversationId", conversationId))
          .set("X-FORWARDED-FOR", ipAddress)
          .send({ message: "hello" });
        expect(res.statusCode).toEqual(500);
        expect(res.body).toStrictEqual({
          error: "Error getting content for text",
        });
      });
    });

    describe("Edge cases", () => {
      describe("No vector search content for user message", () => {
        test("Should respond with 200 and static response", async () => {
          const nonsenseMessage =
            "asdlfkjasdlfk jasdlfkjasdlfk jasdlfkjasdlfjdfhstgra gtyjuikolsdfghjsdghj;sgf;dlfjda; kssdghj;f'afskj ;glskjsfd'aks dsaglfslj; gaflad four score and seven years ago fsdglfsgdj fjlgdfsghjldf lfsgajlhgf";
          const calledEndpoint = endpointUrl.replace(
            ":conversationId",
            conversationId
          );
          const response = await request(app)
            .post(calledEndpoint)
            .set("X-FORWARDED-FOR", ipAddress)
            .send({ message: nonsenseMessage });
          expect(response.statusCode).toBe(200);

          expect(response.body.content).toEqual(
            conversationConstants.NO_RELEVANT_CONTENT
          );
        });
      });
      describe("LLM not available but vector search is", () => {
        const brokenLLmService = makeOpenAiLlm({
          baseUrl: OPENAI_ENDPOINT,
          deployment: OPENAI_CHAT_COMPLETION_DEPLOYMENT,
          apiKey: "definitelyNotARealApiKey",
        });

        let conversationId: ObjectId,
          conversations: ConversationsServiceInterface,
          app: Express;
        let testMongo: MongoDB;
        beforeEach(async () => {
          const dbName = `test-${Date.now()}`;
          testMongo = new MongoDB(MONGODB_CONNECTION_URI, dbName);
          conversations = new ConversationsService(testMongo.db);
          const { _id } = await conversations.create({
            ipAddress,
          });
          conversationId = _id;
          app = express();
          app.use(express.json());
          app.post(
            endpointUrl,
            makeAddMessageToConversationRoute({
              conversations,
              store,
              embed,
              llm: brokenLLmService,
              dataStreamer,
              findNearestNeighborsOptions,
            })
          );
        });
        afterEach(async () => {
          await testMongo.db.dropDatabase();
          await testMongo.close();
        });
        test("should respond with 200, static message, and vector search results", async () => {
          const messageThatHasSearchResults = "Why use MongoDB?";
          const response = await request(app)
            .post(
              endpointUrl.replace(":conversationId", conversationId.toString())
            )
            .set("X-FORWARDED-FOR", ipAddress)
            .send({ message: messageThatHasSearchResults });
          expect(response.statusCode).toBe(200);
          expect(
            response.body.content.startsWith(
              conversationConstants.LLM_NOT_WORKING
            )
          ).toBe(true);
          const markdownLinkRegex =
            /\[\w+.*\]\(https?:\/\/.*\?tck=docs_chatbot\)/g;
          expect(markdownLinkRegex.test(response.body.content)).toBe(true);
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
          const { userMessage, assistantMessage } = await addMessagesToDatabase(
            {
              conversationId,
              userMessageContent,
              assistantMessageContent,
              conversations,
            }
          );
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
        const sampleDbMessage: Message = {
          id: new ObjectId(),
          content: "hello",
          role: "user",
          createdAt: new Date(),
          rating: true,
        };

        const sampleApiMessage =
          convertDbMessageToOpenAiMessage(sampleDbMessage);
        expect(sampleApiMessage).toStrictEqual({
          content: sampleDbMessage.content,
          role: sampleDbMessage.role,
        });
      });

      describe("getContentForText()", () => {
        test("Should return content for relevant text", async () => {
          const text = "MongoDB Atlas";

          const chunks = await getContentForText({
            embed,
            text,
            store,
            ipAddress,
            findNearestNeighborsOptions,
          });
          expect(chunks).toBeDefined();
          expect(chunks.length).toBeGreaterThan(0);
        });
        test("Should not return content for irrelevant text", async () => {
          const text =
            "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikolaf;ldkgsdjfnh;ks'l;addfsghjklafjklsgfjgreaj;agre;jlg;ljewrqjknerqnkjkgn;jwr;lwreg";
          const chunks = await getContentForText({
            embed,
            text,
            store,
            ipAddress,
            findNearestNeighborsOptions: {
              ...findNearestNeighborsOptions,
              minScore: 99,
            },
          });
          expect(chunks).toBeDefined();
          expect(chunks.length).toBe(0);
        });
      });
      describe("generateFurtherReading()", () => {
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
        const tck = "?tck=docs_chatbot";
        test("No sources should return empty string", () => {
          const noChunks: EmbeddedContent[] = [];
          const noFurtherReading = generateFurtherReading({
            chunks: noChunks,
          });
          expect(noFurtherReading).toEqual("");
        });
        test("One source should return one link", () => {
          const oneChunk: EmbeddedContent[] = [chunk1];
          const oneFurtherReading = generateFurtherReading({
            chunks: oneChunk,
          });
          const url = oneChunk[0].url;
          const expectedOneFurtherReading = `\n\nFurther Reading:\n\n[${url}](${url}${tck})\n\n`;
          expect(oneFurtherReading).toEqual(expectedOneFurtherReading);
        });
        test("Multiple sources from same page should return one link", () => {
          const twoChunksSamePage: EmbeddedContent[] = [chunk1, chunk2];
          const oneFurtherReadingSamePage = generateFurtherReading({
            chunks: twoChunksSamePage,
          });
          const url = twoChunksSamePage[0].url;
          const expectedOneFurtherReadingSamePage = `\n\nFurther Reading:\n\n[${url}](${url}${tck})\n\n`;
          expect(oneFurtherReadingSamePage).toEqual(
            expectedOneFurtherReadingSamePage
          );
        });
        test("Multiple sources from different pages should return 1 link per page", () => {
          const twoChunksDifferentPage: EmbeddedContent[] = [chunk1, chunk3];
          const multipleFurtherReadingDifferentPage = generateFurtherReading({
            chunks: twoChunksDifferentPage,
          });
          const [url1, url2] = [
            twoChunksDifferentPage[0].url,
            twoChunksDifferentPage[1].url,
          ];
          const expectedMultipleFurtherReadingDifferentPage = `\n\nFurther Reading:\n\n[${url1}](${url1}${tck})\n\n[${url2}](${url2}${tck})\n\n`;
          expect(multipleFurtherReadingDifferentPage).toEqual(
            expectedMultipleFurtherReadingDifferentPage
          );
          // All three sources. Two from the same page. One from a different page.
          const threeChunks: EmbeddedContent[] = [chunk1, chunk2, chunk3];
          const multipleSourcesWithSomePageOverlap = generateFurtherReading({
            chunks: threeChunks,
          });
          const [otherUrl1, otherUrl2] = [
            threeChunks[0].url,
            threeChunks[2].url,
          ];
          const expectedMultipleSourcesWithSomePageOverlap = `\n\nFurther Reading:\n\n[${otherUrl1}](${otherUrl1}${tck})\n\n[${otherUrl2}](${otherUrl2}${tck})\n\n`;
          expect(multipleSourcesWithSomePageOverlap).toEqual(
            expectedMultipleSourcesWithSomePageOverlap
          );
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

  describe("POST /conversations/:conversationId/messages/:messageId/rating", () => {
    const endpointUrl =
      "/conversations/:conversationId/messages/:messageId/rating";

    let conversation: Conversation;
    let testMsg: Message;
    let testEndpointUrl: string;
    beforeEach(async () => {
      conversation = await conversations.create({ ipAddress });
      testMsg = await conversations.addConversationMessage({
        conversationId: conversation._id,
        content: "hello",
        role: "assistant",
      });
      testEndpointUrl = endpointUrl
        .replace(":conversationId", conversation._id.toHexString())
        .replace(":messageId", String(testMsg.id));
    });

    test("Should return 204 for valid rating", async () => {
      const response = await request(app)
        .post(testEndpointUrl)
        .set("X-Forwarded-For", ipAddress)
        .send({ rating: true });

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
      assert(conversations);
      const updatedConversation = await conversations.findById({
        _id: conversation._id,
      });
      assert(updatedConversation);
      expect(
        updatedConversation.messages[updatedConversation.messages.length - 1]
          .rating
      ).toBe(true);
    });

    it("Should return 400 for invalid request bodies", async () => {
      const res1 = await request(app)
        .post(testEndpointUrl)
        .send({ rating: "blue" });
      expect(res1.statusCode).toEqual(400);

      const res2 = await request(app)
        .post(testEndpointUrl)
        .send({ ratingz: true });
      expect(res2.statusCode).toEqual(400);
    });
    test("Should return 400 for invalid conversation ID", async () => {
      const response = await request(app)
        .post(
          `/conversations/123/messages/${conversation.messages[0].id}/rating`
        )
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ rating: true });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid conversation ID",
      });
    });
    test("Should return 400 for invalid message ID", async () => {
      const response = await request(app)
        .post(`/conversations/${testMsg.id}/messages/123/rating`)
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ rating: true });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid message ID",
      });
    });
    test("Should return 404 for conversation not in DB", async () => {
      const response = await request(app)
        .post(
          `/conversations/${new ObjectId().toHexString()}/messages/${
            testMsg.id
          }/rating`
        )
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ rating: true });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "Conversation not found",
      });
    });
    test("Should return 404 for message not in conversation", async () => {
      const response = await request(app)
        .post(
          `/conversations/${
            conversation._id
          }/messages/${new ObjectId().toHexString()}/rating`
        )
        .set("X-FORWARDED-FOR", ipAddress)
        .send({ rating: true });

      expect(response.statusCode).toBe(404);
      expect(response.body).toEqual({
        error: "Message not found",
      });
    });
    // TODO:(DOCSP-30843) when properly configure IP address capture and validation,
    // this test will need to be refactored.
    describe("IP address validation", () => {
      beforeEach(async () => {
        assert(conversations);

        conversation = await conversations.create({ ipAddress });
        testMsg = await conversations.addConversationMessage({
          conversationId: conversation._id,
          content: "hello",
          role: "assistant",
        });
      });
      test("Should return 403 for different but valid IP address", async () => {
        const differentIpAddress = "192.158.1.38";
        const response = await request(app)
          .post(
            `/conversations/${conversation._id}/messages/${testMsg.id}/rating`
          )
          .set("X-Forwarded-For", differentIpAddress)
          .send({ rating: true });

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
          error: "Invalid IP address for conversation",
        });
      });
    });
  });
});
