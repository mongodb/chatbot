import { createMessage } from "./createMessage";

describe("createMessage", () => {
  it("creates user messages", () => {
    const userMessage = createMessage({
      role: "user",
      content: "hello!",
    });
    expect(userMessage.id).toBeDefined();
    expect(userMessage.role).toBe("user");
    expect(userMessage.content).toBe("hello!");
    expect(new Date(userMessage.createdAt).toISOString()).toEqual(userMessage.createdAt);
  });

  it("creates assistant messages", () => {
    const assistantMessage = createMessage({
      role: "assistant",
      content: "nice to meet you!",
    });
    expect(assistantMessage.id).toBeDefined();
    expect(assistantMessage.role).toBe("assistant");
    expect(assistantMessage.content).toBe("nice to meet you!");
    expect(new Date(assistantMessage.createdAt).toISOString()).toEqual(
      assistantMessage.createdAt
    );
    expect(assistantMessage.references).toEqual([]);
    expect(assistantMessage.metadata).toBeUndefined();
  });

  it("accepts optional values for otherwise generated values (e.g. id, createdAt)", () => {
    const userMessage = createMessage({
      id: "test-id-please-ignore",
      role: "user",
      content: "hello!",
      createdAt: "2024-05-01T12:42:41.782Z",
    });

    expect(userMessage.id).toBe("test-id-please-ignore");
    expect(userMessage.role).toBe("user");
    expect(userMessage.content).toBe("hello!");
    expect(new Date(userMessage.createdAt).toISOString()).toEqual(
      "2024-05-01T12:42:41.782Z"
    );

    const assistantMessage = createMessage({
      id: "test-id-please-ignore",
      role: "assistant",
      content: "nice to meet you!",
      createdAt: "2024-05-01T12:42:41.782Z",
      references: [{ url: "https://example.com", title: "Example Reference" }],
      metadata: {
        verifiedAnswer: {
          _id: "verified-answer-id",
          created: "2024-04-28T10:40:21.222Z",
          updated: "2024-04-29T11:22:03.239Z",
        },
        someUnknownMetadata: {
          answer: 42,
        },
      },
    });
    expect(userMessage.id).toBe("test-id-please-ignore");
    expect(assistantMessage.role).toBe("assistant");
    expect(assistantMessage.content).toBe("nice to meet you!");
    expect(new Date(userMessage.createdAt).toISOString()).toEqual(
      "2024-05-01T12:42:41.782Z"
    );
    expect(assistantMessage.references).toEqual([
      { url: "https://example.com", title: "Example Reference" },
    ]);
    expect(assistantMessage.metadata).toEqual({
      verifiedAnswer: {
        _id: "verified-answer-id",
        created: "2024-04-28T10:40:21.222Z",
        updated: "2024-04-29T11:22:03.239Z",
      },
      someUnknownMetadata: {
        answer: 42,
      },
    });
  });
});
