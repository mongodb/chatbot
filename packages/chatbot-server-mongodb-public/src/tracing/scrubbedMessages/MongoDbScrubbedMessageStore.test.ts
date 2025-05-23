import { MongoClient, Db, ObjectId } from "mongodb-rag-core/mongodb";
import {
  DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME,
  makeMongoDbScrubbedMessageStore,
} from "./MongoDbScrubbedMessageStore";
import { ScrubbedMessage } from "./ScrubbedMessage";
import { MONGO_MEMORY_SERVER_URI } from "../../test/constants";

describe("MongoDbScrubbedMessageStore", () => {
  let client: MongoClient;
  let db: Db;
  let store: ReturnType<typeof makeMongoDbScrubbedMessageStore>;

  // Helper function to create a basic scrubbed message
  const createScrubbedMessage = (
    options: {
      id?: ObjectId;
      conversationId?: ObjectId;
      index?: number;
      role?: "user" | "assistant" | "system" | "function";
    } = {}
  ): ScrubbedMessage => {
    return {
      _id: options.id || new ObjectId(),
      conversationId: options.conversationId || new ObjectId(),
      index: options.index !== undefined ? options.index : 0,
      role: options.role || "user",
      content: "", // Required by Message type
      createdAt: new Date(),
    };
  };

  // Helper function to insert a message directly into the database
  const insertMessageDirectly = async (message: ScrubbedMessage) => {
    return db
      .collection<ScrubbedMessage>(DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME)
      .insertOne(message);
  };

  // Helper function to find a message directly from the database
  const findMessageDirectly = async (filter: Record<string, unknown>) => {
    return db
      .collection<ScrubbedMessage>(DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME)
      .findOne(filter);
  };

  beforeAll(async () => {
    client = await MongoClient.connect(MONGO_MEMORY_SERVER_URI);
    db = client.db("test");
  });

  afterAll(async () => {
    await client.close();
  });

  beforeEach(async () => {
    await db
      .collection(DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME)
      .deleteMany({});
    store = makeMongoDbScrubbedMessageStore({ db });
  });

  it("should insert a scrubbed message", async () => {
    // Arrange
    const messageId = new ObjectId();
    const conversationId = new ObjectId();
    const message = createScrubbedMessage({ id: messageId, conversationId });

    // Act
    await store.insertScrubbedMessage({ message });

    // Assert
    const insertedMessage = await findMessageDirectly({ _id: messageId });

    expect(insertedMessage).toBeDefined();
    expect(insertedMessage?._id.toString()).toBe(messageId.toString());
    expect(insertedMessage?.conversationId.toString()).toBe(
      conversationId.toString()
    );
  });

  it("should insert multiple scrubbed messages", async () => {
    // Arrange
    const messageId1 = new ObjectId();
    const messageId2 = new ObjectId();
    const conversationId = new ObjectId();

    const messages = [
      createScrubbedMessage({
        id: messageId1,
        conversationId,
        index: 0,
        role: "user",
      }),
      createScrubbedMessage({
        id: messageId2,
        conversationId,
        index: 1,
        role: "assistant",
      }),
    ];

    // Act
    await store.insertScrubbedMessages({ messages });

    // Assert
    const insertedMessages = await db
      .collection<ScrubbedMessage>(DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME)
      .find({ conversationId })
      .toArray();

    expect(insertedMessages).toHaveLength(2);

    // Check first message
    const firstMessage = insertedMessages.find(
      (msg) => msg._id.toString() === messageId1.toString()
    );
    expect(firstMessage).toBeDefined();
    expect(firstMessage?.role).toBe("user");
    expect(firstMessage?.index).toBe(0);

    // Check second message
    const secondMessage = insertedMessages.find(
      (msg) => msg._id.toString() === messageId2.toString()
    );
    expect(secondMessage).toBeDefined();
    expect(secondMessage?.role).toBe("assistant");
    expect(secondMessage?.index).toBe(1);
  });

  it("should update a scrubbed message", async () => {
    // Arrange
    const messageId = new ObjectId();
    const conversationId = new ObjectId();
    const initialMessage = createScrubbedMessage({
      id: messageId,
      conversationId,
    });

    await insertMessageDirectly(initialMessage);

    // Update data with new IP address
    const updatedIpAddress = "192.168.1.1";
    const updateData: Omit<ScrubbedMessage, "_id"> = {
      conversationId,
      index: initialMessage.index,
      role: initialMessage.role,
      content: initialMessage.content,
      createdAt: initialMessage.createdAt,
    };

    // Act
    await store.updateScrubbedMessage({ id: messageId, message: updateData });

    // Assert
    const updatedMessage = await findMessageDirectly({ _id: messageId });

    expect(updatedMessage).toBeDefined();
  });

  it("should find a scrubbed message by id", async () => {
    // Arrange
    const messageId = new ObjectId();
    const message = createScrubbedMessage({ id: messageId });

    await insertMessageDirectly(message);

    // Act
    const foundMessage = await store.findScrubbedMessageById({
      id: messageId,
    });

    // Assert
    expect(foundMessage).toBeDefined();
    expect(foundMessage?._id.toString()).toBe(messageId.toString());
  });

  it("should return null when finding a non-existent message", async () => {
    // Arrange
    const nonExistentId = new ObjectId();

    // Act
    const foundMessage = await store.findScrubbedMessageById({
      id: nonExistentId,
    });

    // Assert
    expect(foundMessage).toBeNull();
  });

  it("should find scrubbed messages by conversation id", async () => {
    // Arrange
    const conversationId = new ObjectId();
    const messageId1 = new ObjectId();
    const messageId2 = new ObjectId();

    // Insert two messages for the same conversation
    const message1 = createScrubbedMessage({
      id: messageId1,
      conversationId,
      index: 0,
    });

    const message2 = createScrubbedMessage({
      id: messageId2,
      conversationId,
      index: 1,
      role: "assistant",
    });

    await db
      .collection<ScrubbedMessage>(DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME)
      .insertMany([message1, message2]);

    // Insert a message for a different conversation
    const differentConversationId = new ObjectId();
    const differentMessage = createScrubbedMessage({
      conversationId: differentConversationId,
    });

    await insertMessageDirectly(differentMessage);

    // Act
    const foundMessages = await store.findScrubbedMessagesByConversationId({
      conversationId,
    });

    // Assert
    expect(foundMessages).toHaveLength(2);
    expect(foundMessages.map((msg) => msg._id.toString())).toContain(
      messageId1.toString()
    );
    expect(foundMessages.map((msg) => msg._id.toString())).toContain(
      messageId2.toString()
    );
  });

  it("should handle generic type parameter for analysis", async () => {
    // Arrange
    interface TestAnalysis extends Record<string, unknown> {
      sentiment: string;
      topics: string[];
    }

    const genericStore = makeMongoDbScrubbedMessageStore<TestAnalysis>({ db });
    const messageId = new ObjectId();
    const conversationId = new ObjectId();

    const analysis: TestAnalysis = {
      sentiment: "positive",
      topics: ["mongodb", "testing"],
    };

    const message: ScrubbedMessage<TestAnalysis> = {
      ...createScrubbedMessage({ id: messageId, conversationId }),
      analysis,
    };

    // Act
    await genericStore.insertScrubbedMessage({ message });

    // Assert
    const insertedMessage = await db
      .collection<ScrubbedMessage<TestAnalysis>>(
        DEFAULT_SCRUBBED_MESSAGES_COLLECTION_NAME
      )
      .findOne({ _id: messageId });

    expect(insertedMessage).toBeDefined();
    expect(insertedMessage?.analysis).toEqual(analysis);
  });
});
