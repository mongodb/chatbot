import "dotenv/config";
import { makeMongoDbConversationsService } from "./MongoDbConversations";
import { BSON, MongoClient } from "mongodb";
import {
  Conversation,
  UserMessage,
  AssistantMessage,
  AddSomeMessageParams,
  SystemMessage,
} from "./ConversationsService";

jest.setTimeout(100000);

const systemPrompt = {
  role: "system",
  content: "You shall do as you're told",
} satisfies SystemMessage;

describe("Conversations Service", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  if (!MONGODB_CONNECTION_URI) {
    throw new Error("Missing MONGODB_CONNECTION_URI");
  }
  const mongoClient = new MongoClient(MONGODB_CONNECTION_URI);

  const mongodb = mongoClient.db(`conversations-test-${new Date().getTime()}`); // New DB for each test run

  afterEach(async () => {
    await mongodb.collection("conversations").deleteMany({});
  });
  afterAll(async () => {
    await mongodb.dropDatabase();
    await mongoClient.close();
  });

  const conversationsService = makeMongoDbConversationsService(mongodb);
  test("Should create a conversation", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    expect(conversation).toHaveProperty("_id");
    const conversationInDb = await mongodb
      .collection("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toStrictEqual(conversation);
  });
  test("Should create a conversation with custom data + system prompt(s)", async () => {
    const customData = {
      foo: "bar",
    };
    const conversation = await conversationsService.create({
      customData,
      initialMessages: [systemPrompt],
    });
    expect(conversation).toHaveProperty("customData", customData);
    const conversationInDb = await mongodb
      .collection("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toStrictEqual(conversation);
  });
  test("Should add a message to a conversation", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    const content = "Tell me about MongoDB";
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      message: {
        role: "user",
        content,
        embedding: [1, 2, 3],
      },
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
  });
  test("Should add a message to a conversation with optional fields", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    const contentForLlm = "<processed> Tell me about MongoDB";
    const originalUserContent = "Tell me about MongoDB";
    const embedding = [1, 2, 3];
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      message: {
        role: "user",
        content: originalUserContent,
        contentForLlm,
        embedding,
      },
    });
    expect(newMessage.content).toBe(originalUserContent);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(
      (conversationInDb?.messages[1] as UserMessage).contentForLlm
    ).toStrictEqual(contentForLlm);
    expect(
      (conversationInDb?.messages[1] as UserMessage)?.content
    ).toStrictEqual(originalUserContent);
    expect(
      (conversationInDb?.messages[1] as UserMessage)?.embedding
    ).toStrictEqual(embedding);
  });
  test("Should add a message to a conversation with custom data", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    const content = "Tell me about MongoDB";
    const customData = {
      foo: "bar",
    };
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      message: {
        role: "user",
        content,
        customData,
        embedding: [1, 2, 3],
      },
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
    expect(conversationInDb?.messages[1].customData).toStrictEqual(customData);
  });
  test("Should add a message to a conversation with undefined custom data", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    const content = "Tell me about MongoDB";
    const customData = undefined;
    const newMessage = await conversationsService.addConversationMessage({
      conversationId: conversation._id,
      message: {
        role: "user",
        content,
        customData,
        embedding: [1, 2, 3],
      },
    });
    expect(newMessage.content).toBe(content);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversation._id });
    expect(conversationInDb).toHaveProperty("messages");
    expect(conversationInDb?.messages).toHaveLength(2);
    expect(conversationInDb?.messages[1].content).toStrictEqual(content);
    expect(conversationInDb?.messages[1].customData).toStrictEqual(customData);
  });
  test("should add many conversation messages", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    const content = "Tell me about MongoDB";
    const messages = [
      {
        role: "user",
        content,
        embedding: [1, 2, 3],
      },
      {
        role: "assistant",
        content,
      },
    ] satisfies AddSomeMessageParams[];
    const newMessages = await conversationsService.addManyConversationMessages({
      conversationId: conversation._id,
      messages,
    });
    expect(newMessages).toHaveLength(2);
    expect(newMessages[0]).toMatchObject(messages[0]);
    expect(newMessages[1]).toMatchObject(messages[1]);
  });
  test("Should find a conversation by id", async () => {
    const conversation = await conversationsService.create({
      initialMessages: [systemPrompt],
    });
    const conversationInDb = await conversationsService.findById({
      _id: conversation._id,
    });
    expect(conversationInDb).toEqual(conversation);
  });
  test("Should return null if cannot find a conversation by id", async () => {
    const conversationInDb = await conversationsService.findById({
      _id: new BSON.ObjectId(),
    });
    expect(conversationInDb).toBeNull();
  });
  test("Should rate a message", async () => {
    const { _id: conversationId } = await conversationsService.create({
      initialMessages: [systemPrompt],
    });

    await conversationsService.addConversationMessage({
      conversationId,
      message: {
        role: "user",
        content: "What is the MongoDB Document Model?",
        embedding: [1, 2, 3],
      },
    });

    const assistantMessage = await conversationsService.addConversationMessage({
      conversationId,
      message: {
        role: "assistant",
        content: "That's a good question! Let me explain...",
        references: [],
      },
    });

    const result = await conversationsService.rateMessage({
      conversationId,
      messageId: assistantMessage.id,
      rating: true,
    });

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversationId });

    expect(result).toBe(true);
    expect((conversationInDb?.messages[2] as AssistantMessage)?.rating).toBe(
      true
    );
  });
  test("Should add a user comment to a message", async () => {
    const { _id: conversationId } = await conversationsService.create({
      initialMessages: [systemPrompt],
    });

    await conversationsService.addConversationMessage({
      conversationId,
      message: {
        role: "user",
        content: "What is the MongoDB Document Model?",
        embedding: [1, 2, 3],
      },
    });

    const assistantMessage = await conversationsService.addConversationMessage({
      conversationId,
      message: {
        role: "assistant",
        content: "That's a good question! Let me explain...",
        references: [],
      },
    });

    const rateResult = await conversationsService.rateMessage({
      conversationId,
      messageId: assistantMessage.id,
      rating: true,
    });
    expect(rateResult).toBe(true);

    const comment = "This answer was super helpful!";
    const commentResult = await conversationsService.commentMessage({
      conversationId,
      messageId: assistantMessage.id,
      comment,
    });
    expect(commentResult).toBe(true);

    const conversationInDb = await mongodb
      .collection<Conversation>("conversations")
      .findOne({ _id: conversationId });

    const finalAssistantMessage = conversationInDb
      ?.messages[2] as AssistantMessage;
    expect(finalAssistantMessage?.rating).toBe(true);
    expect(finalAssistantMessage?.userComment).toBe(comment);
  });
});
