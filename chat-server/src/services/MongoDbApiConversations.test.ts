import { MongoClient } from "mongodb";
import { makeMongoDbApiConversationsService } from "./MongoDbApiConversations";
import { baseOpenAiFunctionDefinitions } from "./OpenAiApiChatLlm";
import { ApiConversationsService, BaseMessage } from "./ApiConversations";

describe("makeMongoDbApiConversationsService()", () => {
  const { MONGODB_CONNECTION_URI } = process.env;
  if (!MONGODB_CONNECTION_URI) {
    throw new Error("Missing MONGODB_CONNECTION_URI");
  }
  let conversations: ApiConversationsService;
  const mongoClient = new MongoClient(MONGODB_CONNECTION_URI);
  const randomTestDbName = `testDB${Date.now()}`;
  beforeAll(async () => {
    conversations = makeMongoDbApiConversationsService(
      mongoClient,
      randomTestDbName,
      {
        role: "system",
        content: "system message content",
      },
      baseOpenAiFunctionDefinitions
    );
  });
  afterAll(async () => {
    await mongoClient.db(randomTestDbName).dropDatabase();
    await mongoClient.close();
  });
  it("should create a new conversation", async () => {
    const result = await conversations.create({ ipAddress: "127.0.0.1" });

    expect(result).toHaveProperty("_id");
    expect(result).toHaveProperty("ipAddress", "127.0.0.1");
  });

  it("should add an API conversation message with new system prompt", async () => {
    const { _id: conversationId } = await conversations.create({
      ipAddress: "foo",
    });
    const message = {
      role: "user",
      content: "test content",
    } satisfies BaseMessage;
    const addedMessage = await conversations.addApiConversationMessage({
      conversationId,
      message,
      newSystemPrompt: "new system prompt",
      availableFunctions: [],
    });

    expect(addedMessage).toHaveProperty("id");
    expect(addedMessage).toHaveProperty("createdAt");
    expect(addedMessage).toHaveProperty("role", "user");
    expect(addedMessage).toHaveProperty("content", "test content");
    expect(addedMessage).toHaveProperty("systemPrompt", "new system prompt");

    const conversation = await conversations.findById({ _id: conversationId });
    expect(
      conversation?.messages.find((msg) => msg.role === "system")
    ).toHaveProperty("content", "new system prompt");
  });
  it("should add API conversation message without new system prompt", async () => {
    const { _id: conversationId } = await conversations.create({
      ipAddress: "foo",
    });
    const message = {
      role: "user",
      content: "test content",
    } satisfies BaseMessage;
    const addedMessage = await conversations.addApiConversationMessage({
      conversationId,
      message,
      availableFunctions: [],
    });

    expect(addedMessage).toHaveProperty("id");
    expect(addedMessage).toHaveProperty("createdAt");
    expect(addedMessage).toHaveProperty("role", "user");
    expect(addedMessage).toHaveProperty("content", "test content");
    expect(addedMessage).toHaveProperty(
      "systemPrompt",
      "system message content"
    );

    const conversation = await conversations.findById({ _id: conversationId });
    expect(
      conversation?.messages.find((msg) => msg.role === "system")
    ).toHaveProperty("content", "system message content");
  });

  it("should find conversation by ID", async () => {
    const { _id } = await conversations.create({ ipAddress: "foo" });

    const result = await conversations.findById({ _id });
    expect(result).toHaveProperty("_id", _id);
  });

  it("should rate a message", async () => {
    const conversation = await conversations.create({ ipAddress: "foo" });
    const message = await conversations.addApiConversationMessage({
      conversationId: conversation._id,
      message: {
        role: "assistant",
        content: "test content",
      },
      availableFunctions: [],
    });

    const result = await conversations.rateMessage({
      conversationId: conversation._id,
      messageId: message.id,
      rating: true,
    });

    expect(result).toBeTruthy();
  });
});
