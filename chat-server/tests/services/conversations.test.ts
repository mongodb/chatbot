import "dotenv/config";
import { MongoDB } from "../../src/integrations/mongodb";
import {
  Conversation,
  ConversationsService,
} from "../../src/services/conversations";
import { BSON } from "mongodb";

describe("Conversations Service", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  const mongodb = new MongoDB(
    MONGODB_CONNECTION_URI!,
    `conversations-test-${new Date().getTime()}` // New DB for each test run
  );

  afterEach(async () => {
    await mongodb.db.collection("conversations").deleteMany({});
  });
  afterAll(async () => {
    await mongodb.db.dropDatabase();
    await mongodb.close();
  });

  const conversationsService = new ConversationsService(mongodb.db);
  test("Should create a conversation", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    expect(conversation).toHaveProperty("_id");
    expect(conversation).toHaveProperty("ipAddress", ipAddress);
    const conversationInDb = await mongodb.db
      .collection("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toStrictEqual(conversation);
  });
  test("Should add a message to a conversation", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    // TODO: rename variable answer b/c makes no sense b/c it's a question
    const answer = "Tell me about MongoDB";
    const newMessage = await conversationsService.addUserMessage({
      conversationId: conversation._id,
      answer,
    });
    expect(newMessage).toBe(true);

    const conversationInDb = await mongodb.db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(3);
    expect(conversationInDb?.messages[2].content).toStrictEqual(answer);
  });
  test("Should find a conversation by id", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    const conversationInDb = await conversationsService.findById({
      _id: conversation._id,
    });
    expect(conversationInDb).toStrictEqual(conversation);
  });
  test("Should rate a message", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    const messageId = conversation.messages[0].id;
    const rating = true;
    const result = await conversationsService.rateMessage({
      conversationId: conversation._id,
      messageId,
      rating,
    });
    expect(result).toBe(true);
    const conversationInDb = await mongodb.db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb?.messages[2].rating).toBe(rating);
  });
});
