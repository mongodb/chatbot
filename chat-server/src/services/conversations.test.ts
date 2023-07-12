import "dotenv/config";
import { MongoDB } from "chat-core";
import { Conversation, ConversationsService } from "./conversations";
import { BSON } from "mongodb";

jest.setTimeout(100000);

describe("Conversations Service", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  if (!MONGODB_CONNECTION_URI) {
    throw new Error("Missing MONGODB_CONNECTION_URI");
  }
  const mongodb = new MongoDB(
    MONGODB_CONNECTION_URI,
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
    const content = "Tell me about MongoDB";
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      role: "user",
      content,
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb.db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(3);
    expect(conversationInDb?.messages[2].content).toStrictEqual(content);
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
  test("Should return null if cannot find a conversation by id", async () => {
    const conversationInDb = await conversationsService.findById({
      _id: new BSON.ObjectId(),
    });
    expect(conversationInDb).toBeNull();
  });
  test("Should rate a message", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    const messageId = conversation.messages[1].id;
    const rating = true;
    const result = await conversationsService.rateMessage({
      conversationId: conversation._id,
      messageId,
      rating,
    });
    const conversationInDb = await mongodb.db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(result).toBe(true);
    expect(conversationInDb?.messages[1].rating).toBe(rating);
  });
});
