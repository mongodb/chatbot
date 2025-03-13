import { MongoClient, Db, ObjectId } from "mongodb";
import { MongoMemoryServer } from "mongodb-memory-server";
import { scrubMessages } from "./scrubMessages";
import { Conversation, Message } from "mongodb-chatbot-server";
import { ScrubbedMessage } from "./ScrubbedMessage";

describe("scrubMessages", () => {
  let mongoServer: MongoMemoryServer;
  let client: MongoClient;
  let db: Db;

  beforeAll(async () => {
    // Start MongoDB in-memory server
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    client = await MongoClient.connect(uri);
    db = client.db("test");
  });

  afterAll(async () => {
    // Clean up resources
    await client.close();
    await mongoServer.stop();
  });

  beforeEach(async () => {
    // Clear collections before each test
    await db.collection("conversations").deleteMany({});
    await db.collection("scrubbed_messages").deleteMany({});
  });

  it("should scrub messages from conversations", async () => {
    // Arrange: Create test conversations with messages
    const conversationId = new ObjectId();
    const messageId1 = new ObjectId();
    const messageId2 = new ObjectId();
    const createdAt = new Date();

    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: messageId1,
          role: "user",
          content: "This is a test message with PII",
          createdAt,
        } as Message,
        {
          id: messageId2,
          role: "assistant",
          content: "This is a response",
          createdAt: new Date(createdAt.getTime() + 1000),
          rating: true,
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Check that messages were properly scrubbed and stored
    const scrubbedMessages = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .find({})
      .toArray();

    // Should have 2 scrubbed messages (user and assistant)
    expect(scrubbedMessages.length).toBe(2);

    // Check user message
    const userMessage = scrubbedMessages.find(
      (msg) => msg._id.toString() === messageId1.toString()
    );
    expect(userMessage).toBeDefined();
    expect(userMessage?.conversationId.toString()).toBe(
      conversationId.toString()
    );
    expect(userMessage?.role).toBe("user");
    expect(userMessage?.index).toBe(0);
    expect(userMessage?.createdAt).toEqual(createdAt);
    // Content should not be present in scrubbed message
    expect((userMessage as { content?: string }).content).toBeUndefined();

    // Check assistant message
    const assistantMessage = scrubbedMessages.find(
      (msg) => msg._id.toString() === messageId2.toString()
    );
    expect(assistantMessage).toBeDefined();
    expect(assistantMessage?.conversationId.toString()).toBe(
      conversationId.toString()
    );
    expect(assistantMessage?.role).toBe("assistant");
    expect(assistantMessage?.index).toBe(1);
    // Check rating if it exists
    if (assistantMessage && "rating" in assistantMessage) {
      expect(assistantMessage.rating).toBe(true);
    }
    // Content should not be present in scrubbed message
    expect((assistantMessage as { content?: string }).content).toBeUndefined();
  });

  it("should only scrub messages created after the latest scrubbed message date", async () => {
    // Arrange: Create an existing scrubbed message
    const oldConversationId = new ObjectId();
    const oldMessageId = new ObjectId();
    const oldDate = new Date(2023, 0, 1); // January 1, 2023

    const existingScrubbed: ScrubbedMessage = {
      _id: oldMessageId,
      conversationId: oldConversationId,
      ipAddress: "127.0.0.1",
      index: 0,
      role: "user",
      createdAt: oldDate,
    };

    await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .insertOne(existingScrubbed);

    // Create a new conversation with one old message (before the existing scrubbed message)
    // and one new message (after the existing scrubbed message)
    const conversationId = new ObjectId();
    const oldMsgId = new ObjectId();
    const newMsgId = new ObjectId();

    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: oldMsgId,
          role: "user",
          content: "This is an old message",
          createdAt: new Date(2022, 11, 31), // December 31, 2022 (before oldDate)
        } as Message,
        {
          id: newMsgId,
          role: "user",
          content: "This is a new message",
          createdAt: new Date(2023, 0, 2), // January 2, 2023 (after oldDate)
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Only the new message should be scrubbed
    const scrubbedMessages = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .find({ conversationId })
      .toArray();

    expect(scrubbedMessages.length).toBe(2);
    // Check that the new message ID is in the scrubbed messages
    expect(
      scrubbedMessages.some((msg) => msg._id.toString() === newMsgId.toString())
    ).toBe(true);

    // The total count should be 3 (the original scrubbed message + the two new ones)
    const totalCount = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .countDocuments();
    expect(totalCount).toBe(3);
  });

  it("should handle conversations with no messages", async () => {
    // Arrange: Create an empty conversation
    const conversationId = new ObjectId();
    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: No scrubbed messages should be created
    const scrubbedMessages = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .find({})
      .toArray();

    expect(scrubbedMessages.length).toBe(0);
  });

  it("should preserve message metadata and references", async () => {
    // Arrange: Create a conversation with messages containing metadata and references
    const conversationId = new ObjectId();
    const messageId = new ObjectId();
    const metadata = { source: "test", page: 1 };
    const references = [{ title: "Test Doc", url: "https://example.com" }];

    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: messageId,
          role: "assistant",
          content: "This is a response with metadata and references",
          createdAt: new Date(),
          metadata,
          references,
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Metadata and references should be preserved in the scrubbed message
    const scrubbedMessage = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .findOne({ _id: messageId });

    expect(scrubbedMessage).toBeDefined();
    expect(scrubbedMessage?.metadata).toEqual(metadata);
    // Check references if they exist
    if (scrubbedMessage && "references" in scrubbedMessage) {
      expect(scrubbedMessage.references).toEqual(references);
    }
  });

  it("should handle custom data in messages", async () => {
    // Arrange: Create a conversation with a message containing custom data
    const conversationId = new ObjectId();
    const messageId = new ObjectId();
    const customData = { foo: "bar", baz: 123 };

    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: messageId,
          role: "user",
          content: "Message with custom data",
          createdAt: new Date(),
          customData,
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Custom data should be preserved in the scrubbed message
    const scrubbedMessage = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .findOne({ _id: messageId });

    expect(scrubbedMessage).toBeDefined();
    expect(scrubbedMessage?.customData).toEqual(customData);
  });

  it("should handle system messages correctly", async () => {
    // Arrange: Create a conversation with a system message
    const conversationId = new ObjectId();
    const messageId = new ObjectId();
    const createdAt = new Date();

    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: messageId,
          role: "system",
          content: "This is a system message",
          createdAt,
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: System message should be scrubbed
    const scrubbedMessage = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .findOne({ _id: messageId });

    expect(scrubbedMessage).toBeDefined();
    expect(scrubbedMessage?.role).toBe("system");
    expect(scrubbedMessage?.index).toBe(0);
    expect((scrubbedMessage as { content?: string }).content).toBeUndefined();
  });

  it("should handle messages with missing fields gracefully", async () => {
    // Arrange: Create a conversation with a message missing some fields
    const conversationId = new ObjectId();
    const messageId = new ObjectId();

    // Create a message without createdAt field
    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: messageId,
          role: "user",
          content: "Message with missing fields",
          // createdAt is intentionally missing
        } as unknown as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Message should still be scrubbed despite missing fields
    const scrubbedMessages = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .find({})
      .toArray();

    // Should still process the message
    expect(scrubbedMessages.length).toBe(1);
    expect(scrubbedMessages[0]._id.toString()).toBe(messageId.toString());
  });

  it("should handle multiple conversations correctly", async () => {
    // Arrange: Create multiple conversations
    const conversation1Id = new ObjectId();
    const message1Id = new ObjectId();
    const conversation2Id = new ObjectId();
    const message2Id = new ObjectId();

    const conversation1: Partial<Conversation> = {
      _id: conversation1Id,
      messages: [
        {
          id: message1Id,
          role: "user",
          content: "Message from conversation 1",
          createdAt: new Date(),
        } as Message,
      ],
    };

    const conversation2: Partial<Conversation> = {
      _id: conversation2Id,
      messages: [
        {
          id: message2Id,
          role: "user",
          content: "Message from conversation 2",
          createdAt: new Date(),
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertMany([conversation1, conversation2] as Conversation[]);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Messages from both conversations should be scrubbed
    const scrubbedMessages = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .find({})
      .toArray();

    expect(scrubbedMessages.length).toBe(2);

    // Check that messages from both conversations are present
    const conversation1Messages = scrubbedMessages.filter(
      (msg) => msg.conversationId.toString() === conversation1Id.toString()
    );
    const conversation2Messages = scrubbedMessages.filter(
      (msg) => msg.conversationId.toString() === conversation2Id.toString()
    );

    expect(conversation1Messages.length).toBe(1);
    expect(conversation2Messages.length).toBe(1);
    expect(conversation1Messages[0]._id.toString()).toBe(message1Id.toString());
    expect(conversation2Messages[0]._id.toString()).toBe(message2Id.toString());
  });

  it("should handle error in aggregation pipeline gracefully", async () => {
    // Create a spy on console.error to verify it's called
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();

    // Create a mock db with a collection that throws an error during aggregation
    const mockDb = {
      collection: jest.fn().mockReturnValue({
        aggregate: jest.fn().mockReturnValue({
          toArray: jest.fn().mockRejectedValue(new Error("Aggregation error")),
        }),
        find: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              toArray: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    };

    // Act: Run the scrubMessages function with the mock db
    await scrubMessages({ db: mockDb as unknown as Db });

    // Assert: Error should be caught and logged
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining(
        "Aggregation failed with message: Aggregation error"
      )
    );

    // Clean up
    consoleErrorSpy.mockRestore();
  });

  it("should set userCommented field based on presence of userComment", async () => {
    // Arrange: Create a conversation with messages with and without userComment
    const conversationId = new ObjectId();
    const messageWithCommentId = new ObjectId();
    const messageWithoutCommentId = new ObjectId();
    const messageWithEmptyCommentId = new ObjectId();
    const createdAt = new Date();
    const userComment = "This is a user comment";

    const conversation: Partial<Conversation> = {
      _id: conversationId,
      messages: [
        {
          id: messageWithCommentId,
          role: "assistant",
          content: "Message with user comment",
          createdAt: new Date(createdAt.getTime()),
          userComment, // Message with userComment
        } as Message,
        {
          id: messageWithoutCommentId,
          role: "assistant",
          content: "Message without user comment",
          createdAt: new Date(createdAt.getTime() + 1000),
          // No userComment field
        } as Message,
        {
          id: messageWithEmptyCommentId,
          role: "assistant",
          content: "Message with empty user comment",
          createdAt: new Date(createdAt.getTime() + 2000),
          userComment: "", // Empty userComment
        } as Message,
      ],
    };

    await db
      .collection<Conversation>("conversations")
      .insertOne(conversation as Conversation);

    // Act: Run the scrubMessages function
    await scrubMessages({ db });

    // Assert: Check that userCommented field is set correctly
    const scrubbedMessages = await db
      .collection<ScrubbedMessage>("scrubbed_messages")
      .find({})
      .toArray();

    expect(scrubbedMessages.length).toBe(3);

    // Check message with userComment
    const messageWithComment = scrubbedMessages.find(
      (msg) => msg._id.toString() === messageWithCommentId.toString()
    );
    expect(messageWithComment).toBeDefined();
    expect(messageWithComment?.userCommented).toBe(true);
    // Original userComment should not be present
    expect(
      (messageWithComment as { userComment?: string }).userComment
    ).toBeUndefined();

    // Check message without userComment
    const messageWithoutComment = scrubbedMessages.find(
      (msg) => msg._id.toString() === messageWithoutCommentId.toString()
    );
    expect(messageWithoutComment).toBeDefined();
    expect(messageWithoutComment?.userCommented).toBe(false);

    // Check message with empty userComment (should still be true since the field exists)
    const messageWithEmptyComment = scrubbedMessages.find(
      (msg) => msg._id.toString() === messageWithEmptyCommentId.toString()
    );
    expect(messageWithEmptyComment).toBeDefined();
    expect(messageWithEmptyComment?.userCommented).toBe(true);
  });
});
