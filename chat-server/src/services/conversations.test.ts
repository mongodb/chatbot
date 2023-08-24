import "dotenv/config";
import { MongoDB } from "chat-core";
import { Conversation, makeConversationsService } from "./conversations";
import { BSON } from "mongodb";
import { config } from "../config";

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

  const conversationsService = makeConversationsService(
    mongodb.db,
    config.llm.systemPrompt
  );
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
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
  });
  test("Should add a message to a conversation with optional fields", async () => {
    const ipAddress = new BSON.UUID().toString();
    const conversation = await conversationsService.create({
      ipAddress,
    });
    const content = "Tell me about MongoDB";
    const preprocessedContent = "<preprocessed> Tell me about MongoDB";
    const references = [{ title: "ref", url: "ref.com" }];
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      role: "user",
      content,
      preprocessedContent,
      references,
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb.db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
    expect(conversationInDb?.messages[1]?.preprocessedContent).toStrictEqual(
      preprocessedContent
    );
    expect(conversationInDb?.messages[1]?.references).toStrictEqual(references);
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
    const { _id: conversationId } = await conversationsService.create({
      ipAddress,
    });

    await conversationsService.addConversationMessage({
      conversationId,
      role: "user",
      content: "What is the MongoDB Document Model?",
    });

    const assistantMessage = await conversationsService.addConversationMessage({
      conversationId,
      role: "assistant",
      content: "That's a good question! Let me explain...",
    });

    const result = await conversationsService.rateMessage({
      conversationId,
      messageId: assistantMessage.id,
      rating: true,
    });

    const conversationInDb = await mongodb.db
      .collection<Conversation>("conversations")
      .findOne({ _id: conversationId });

    expect(result).toBe(true);
    expect(conversationInDb?.messages[2].rating).toBe(true);
  });
});
