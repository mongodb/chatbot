import request from "supertest";
import "dotenv/config";
import {
  OpenAiChatClient,
  OpenAiEmbeddingsClient,
  MongoDB,
  EmbeddingService,
  OpenAiEmbeddingProvider,
} from "chat-core";
import {
  Conversation,
  ConversationsService,
  Message,
} from "../../services/conversations";
import express from "express";
import {
  AddMessageRequestBody,
  makeAddMessageToConversationRoute,
  convertDbMessageToOpenAiMessage,
  generateFurtherReading,
  validateApiConversationFormatting,
  getContentForText,
} from "./addMessageToConversation";
import { makeCreateConversationRoute } from "./createConversation";
import { ApiConversation, ApiMessage } from "./utils";
import {
  Content,
  ContentService,
  makeContentServiceOptions,
} from "chat-core/src/services/content";
import { OpenAiLlmProvider } from "../../services/llm";
import { DataStreamerService } from "../../services/dataStreamer";
import { stripIndent } from "common-tags";
import { ObjectId } from "mongodb";
import { makeRateMessageRoute } from "./rateMessage";

jest.setTimeout(100000);
const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_ENDPOINT,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  OPENAI_EMBEDDING_MODEL_VERSION,
  OPENAI_CHAT_COMPLETION_DEPLOYMENT,
  VECTOR_SEARCH_INDEX_NAME,
} = process.env;

describe("Conversations Router", () => {
  // create route with mock service
  describe("POST /conversations/", () => {
    const app = express();
    app.use(express.json()); // for parsing application/json
    const testDbName = `conversations-test-${Date.now()}`;
    const mongodb = new MongoDB(MONGODB_CONNECTION_URI!, testDbName);

    const conversations = new ConversationsService(mongodb.db);
    afterAll(async () => {
      await mongodb.db.dropDatabase();
      await mongodb.close();
    });
    app.post("/conversations/", makeCreateConversationRoute({ conversations }));
    it("should respond with 200 and create a conversation", async () => {
      const before = Date.now();
      const res = await request(app).post("/conversations/").send();
      const conversation: ApiConversation = res.body;
      expect(res.statusCode).toEqual(200);

      expect(conversation.messages).toHaveLength(0);
      const count = await mongodb.db
        .collection("conversations")
        .countDocuments();
      expect(count).toBe(1);
    });
  });

  describe("POST /conversations/:conversationId/messages", () => {
    const app = express();
    app.use(express.json()); // for parsing application/json
    // set up conversations service
    const conversationMessageTestDbName = `convo-msg-test-${Date.now()}`;
    const conversationsMongoDb = new MongoDB(
      MONGODB_CONNECTION_URI!,
      conversationMessageTestDbName
    );
    const conversations = new ConversationsService(conversationsMongoDb.db);

    // set up content service
    const contentMongoDb = new MongoDB(
      MONGODB_CONNECTION_URI!,
      MONGODB_DATABASE_NAME!,
      VECTOR_SEARCH_INDEX_NAME!
    );
    const content = new ContentService(
      contentMongoDb.db,
      makeContentServiceOptions({
        indexName: contentMongoDb.vectorSearchIndexName,
      })
    );

    // set up embeddings service
    const embeddings = new EmbeddingService(
      new OpenAiEmbeddingProvider(
        new OpenAiEmbeddingsClient(
          OPENAI_ENDPOINT!,
          OPENAI_EMBEDDING_DEPLOYMENT!,
          OPENAI_API_KEY!,
          OPENAI_EMBEDDING_MODEL_VERSION!
        )
      )
    );

    // set up llm service
    const llm = new OpenAiLlmProvider(
      new OpenAiChatClient(
        OPENAI_ENDPOINT!,
        OPENAI_CHAT_COMPLETION_DEPLOYMENT!,
        OPENAI_API_KEY!
      )
    );

    // set up data streamer
    // TODO: make real data streamer
    const dataStreamer = new DataStreamerService();

    app.post(
      "/conversations/:conversationId/messages/",
      makeAddMessageToConversationRoute({
        conversations,
        content,
        embeddings,
        llm,
        dataStreamer,
      })
    );
    // For set up. Need to create conversation before can add to it.
    app.post("/conversations/", makeCreateConversationRoute({ conversations }));
    let _id: string;
    beforeEach(async () => {
      const createConversationRes = await request(app)
        .post("/conversations/")
        .send();
      const res: ApiConversation = createConversationRes.body;
      _id = res._id;
    });

    afterAll(async () => {
      await conversationsMongoDb.db.dropDatabase();
      await conversationsMongoDb.close();
      await contentMongoDb.close();
    });

    describe("Awaited response", () => {
      it("should respond with 200, add messages to the conversation, and respond", async () => {
        const requestBody: AddMessageRequestBody = {
          message:
            "how can i use mongodb products to help me build my new mobile app?",
        };
        const res = await request(app)
          .post(`/conversations/${_id}/messages/`)
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
          .post(`/conversations/${_id}/messages/`)
          .send(request2Body);
        const message2: ApiMessage = res2.body;
        expect(res2.statusCode).toEqual(200);
        expect(message2.role).toBe("assistant");
        expect(message2.content).toContain("Realm");
        const conversationInDb = await conversationsMongoDb.db
          .collection<Conversation>("conversations")
          .findOne({
            _id: new ObjectId(_id),
          });
        expect(conversationInDb?.messages).toHaveLength(6); // system, assistant, user, assistant, user, assistant
      });
    });

    describe.skip("Streamed response", () => {
      // TODO: (DOCSP-30620) add in when data streamer is implemented
    });
    describe.skip("Error handing", () => {
      // TODO: (DOCSP-30945) add in soon. just not including in DOCSP-30616 so that we can build on top of it
    });

    describe("Utility functions", () => {
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
        const ipAddress = "someIpAddress";
        test("Should return content for relevant text", async () => {
          const text = "MongoDB Atlas";

          const chunks = await getContentForText({
            embeddings,
            text,
            content,
            ipAddress,
          });
          expect(chunks).toBeDefined();
          expect(chunks.length).toBeGreaterThan(0);
        });
        test("Should not return content for irrelevant text", async () => {
          const text =
            "asdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjasdlfkjafdshgjfkhfdugytfasfghjkujufgjdfhstgragtyjuikol";
          const chunks = await getContentForText({
            embeddings,
            text,
            content,
            ipAddress,
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
          numTokens: 100,
          embedding: [0.1, 0.2, 0.3],
          lastUpdated: new Date(),
          site: {
            name: "MongoDB Realm",
            url: "https://mongodb.com/docs/realm/",
          },
        };
        const chunk2 = {
          _id: new ObjectId(),
          url: "https://mongodb.com/docs/realm/sdk/node/",
          text: "blah blah blah",
          numTokens: 100,
          embedding: [0.1, 0.2, 0.3],
          lastUpdated: new Date(),
          site: {
            name: "MongoDB Realm",
            url: "https://mongodb.com/docs/realm/",
          },
        };
        const chunk3 = {
          _id: new ObjectId(),
          url: "https://mongodb.com/docs/realm/sdk/node/xyz",
          text: "blah blah blah",
          numTokens: 100,
          embedding: [0.1, 0.2, 0.3],
          lastUpdated: new Date(),
          site: {
            name: "MongoDB Realm",
            url: "https://mongodb.com/docs/realm/",
          },
        };
        test("No sources should return empty string", () => {
          const noChunks: Content[] = [];
          const noFurtherReading = generateFurtherReading({ chunks: noChunks });
          expect(noFurtherReading).toEqual("");
        });
        test("One source should return one link", () => {
          const oneChunk: Content[] = [chunk1];
          const oneFurtherReading = generateFurtherReading({
            chunks: oneChunk,
          });
          const expectedOneFurtherReading = `\n\nArticles Referenced:\n${oneChunk[0].url}\n\n`;
          expect(oneFurtherReading).toEqual(expectedOneFurtherReading);
        });
        test("Multiple sources from same page should return one link", () => {
          const twoChunksSamePage: Content[] = [chunk1, chunk2];
          const oneFurtherReadingSamePage = generateFurtherReading({
            chunks: twoChunksSamePage,
          });
          const expectedOneFurtherReadingSamePage = `\n\nArticles Referenced:\n${twoChunksSamePage[0].url}\n\n`;
          expect(oneFurtherReadingSamePage).toEqual(
            expectedOneFurtherReadingSamePage
          );
        });
        test("Multiple sources from different pages should return 1 link per page", () => {
          const twoChunksDifferentPage: Content[] = [chunk1, chunk3];
          const multipleFurtherReadingDifferentPage = generateFurtherReading({
            chunks: twoChunksDifferentPage,
          });
          const expectedMultipleFurtherReadingDifferentPage = `\n\nArticles Referenced:\n${twoChunksDifferentPage[0].url}\n${twoChunksDifferentPage[1].url}\n\n`;
          expect(multipleFurtherReadingDifferentPage).toEqual(
            expectedMultipleFurtherReadingDifferentPage
          );
          // All three sources. Two from the same page. One from a different page.
          const threeChunks: Content[] = [chunk1, chunk2, chunk3];
          const multipleSourcesWithSomePageOverlap = generateFurtherReading({
            chunks: threeChunks,
          });
          const expectedMultipleSourcesWithSomePageOverlap = `\n\nArticles Referenced:\n${threeChunks[0].url}\n${threeChunks[2].url}\n\n`;
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
    const app = express();
    app.use(express.json()); // for parsing application/json
    const testDbName = `conversations-test-${Date.now()}`;
    const mongodb = new MongoDB(MONGODB_CONNECTION_URI!, testDbName);

    const conversations = new ConversationsService(mongodb.db);
    app.post(
      "/conversations/:conversationId/messages/:messageId/rating",
      makeRateMessageRoute({ conversations })
    );
    const ipAddress = "<NOT CAPTURING IP ADDRESS YET>";
    let conversation: Conversation;
    let testMsg: Message;
    beforeAll(async () => {
      conversation = await conversations.create({ ipAddress });
      testMsg = await conversations.addConversationMessage({
        conversationId: conversation._id,
        content: "hello",
        role: "assistant",
      });
    });

    afterAll(async () => {
      await mongodb.db.dropDatabase();
      await mongodb.close();
    });
    test("Should return 204 for valid rating", async () => {
      const response = await request(app)
        .post(
          `/conversations/${conversation._id}/messages/${testMsg.id}/rating`
        )
        .send({ rating: true });

      expect(response.statusCode).toBe(204);
      expect(response.body).toEqual({});
      const updatedConversation = await conversations.findById({
        _id: conversation._id,
      });
      expect(
        updatedConversation.messages[updatedConversation.messages.length - 1]
          .rating
      ).toBe(true);
    });
    test("Should return 400 for invalid conversation ID", async () => {
      const response = await request(app)
        .post(
          `/conversations/123/messages/${conversation.messages[0].id}/rating`
        )
        .send({ rating: true });

      expect(response.statusCode).toBe(400);
      expect(response.body).toEqual({
        error: "Invalid conversation ID",
      });
    });
    test("Should return 400 for invalid message ID", async () => {
      const response = await request(app)
        .post(`/conversations/${testMsg.id}/messages/123/rating`)
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
        const ipAddress = "abc.123.xyz.456";
        conversation = await conversations.create({ ipAddress });
        testMsg = await conversations.addConversationMessage({
          conversationId: conversation._id,
          content: "hi",
          role: "user",
        });
      });
      test("Should return 403 for invalid IP address", async () => {
        const response = await request(app)
          .post(
            `/conversations/${conversation._id}/messages/${testMsg.id}/rating`
          )
          .send({ rating: true });

        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
          error: "Invalid IP address for conversation",
        });
      });
    });
  });
});
