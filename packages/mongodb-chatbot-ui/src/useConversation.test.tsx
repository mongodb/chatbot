import { vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useConversation, type UseConversationParams } from "./useConversation";
import { ObjectId } from "bson";
import { mockNextFetchResult } from "./test-utils";
import { ConversationStateProvider } from "./ConversationStateProvider";

const baseUseConversationParams = {
  serverBaseUrl: "http://localhost:3000/api/v1",
  shouldStream: false,
} satisfies UseConversationParams;

function renderUseConversation(options: UseConversationParams) {
  return renderHook(() => useConversation(options), {
    wrapper: ConversationStateProvider,
  });
}

describe("useConversation", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the conversation state & methods to interact with it", () => {
    const {
      result: { current: conversation },
    } = renderUseConversation(baseUseConversationParams);

    // Default state
    expect(conversation).toBeDefined();
    expect(conversation.conversationId).toBeUndefined();
    expect(conversation.messages).toEqual([]);
    expect(conversation.error).toBeUndefined();
    // Methods
    expect(conversation.createConversation).toBeDefined();
    expect(conversation.switchConversation).toBeDefined();
    expect(conversation.submit).toBeDefined();
    expect(conversation.rateMessage).toBeDefined();
    expect(conversation.commentMessage).toBeDefined();
  });

  it("creates a new conversation", async () => {
    const { result } = renderUseConversation(baseUseConversationParams);

    mockNextFetchResult({
      json: {
        _id: new ObjectId().toHexString(),
        createdAt: Date.now(),
        messages: [],
      },
    });
    await act(async () => {
      await result.current.createConversation();
    });
    await waitFor(() => {
      expect(result.current.conversationId).not.toBeUndefined();
      expect(result.current.error).toBeUndefined();
      expect(result.current.messages).toEqual([]);
    });
  });

  it("switches to new and existing conversations", async () => {
    const { result } = renderUseConversation(baseUseConversationParams);

    const firstConversation = {
      _id: new ObjectId().toHexString(),
      createdAt: Date.now(),
      messages: [],
    };

    const secondConversation = {
      _id: new ObjectId().toHexString(),
      createdAt: Date.now(),
      messages: [],
    };

    // Create the first conversation
    mockNextFetchResult({
      json: firstConversation,
    });
    await act(async () => {
      await result.current.createConversation();
    });
    await waitFor(() => {
      expect(result.current.conversationId).toBe(firstConversation._id);
    });

    // Create (and switch to) the second conversation
    mockNextFetchResult({
      json: secondConversation,
    });
    await act(async () => {
      await result.current.createConversation();
    });
    await waitFor(() => {
      expect(result.current.conversationId).toBe(secondConversation._id);
    });

    // Switch back to the first conversation
    mockNextFetchResult({
      json: firstConversation,
    });
    await act(async () => {
      result.current.switchConversation(firstConversation._id);
    });
    await waitFor(() => {
      expect(result.current.conversationId).toBe(firstConversation._id);
    });
  });

  it("adds a new user message + assistant response to the conversation", async () => {
    const { result } = renderUseConversation(baseUseConversationParams);

    // Create a new conversation
    mockNextFetchResult({
      json: {
        _id: new ObjectId().toHexString(),
        createdAt: Date.now(),
        messages: [],
      },
    });
    await act(async () => {
      await result.current.createConversation();
    });
    await waitFor(() => {
      expect(result.current.conversationId).not.toBeUndefined();
    });

    // Add a user message
    const userMessage = "Hello from the user";
    mockNextFetchResult({
      json: {
        _id: new ObjectId().toHexString(),
        role: "assistant",
        content: "Hello from the assistant",
        createdAt: Date.now(),
      },
    });
    await act(async () => {
      await result.current.submit(userMessage);
    });
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe(userMessage);
      expect(result.current.messages[1].role).toBe("assistant");
      expect(result.current.messages[1].content).toBe(
        "Hello from the assistant"
      );
    });
  });

  it("rates an assistant message", async () => {
    const { result } = renderUseConversation(baseUseConversationParams);

    // Create a new conversation
    mockNextFetchResult({
      json: {
        _id: new ObjectId().toHexString(),
        createdAt: Date.now(),
        messages: [],
      },
    });
    await act(async () => {
      await result.current.createConversation();
    });
    await waitFor(() => {
      expect(result.current.conversationId).not.toBeUndefined();
    });

    // Add a user message
    mockNextFetchResult({
      json: {
        _id: new ObjectId().toHexString(),
        role: "assistant",
        content: "Hello from the assistant",
        createdAt: Date.now(),
      },
    });
    await act(async () => {
      await result.current.submit("Hello from the user");
    });
    await waitFor(() => {
      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].role).toBe("user");
    });

    // Rate the assistant message
    const assistantMessage = result.current.messages.find(
      (m) => m.role === "assistant"
    );
    if (!assistantMessage) {
      throw new Error("Assistant message not found");
    }
    expect(assistantMessage.rating).toBeUndefined();

    mockNextFetchResult({
      status: 204,
      json: {},
    });
    await act(async () => {
      await result.current.rateMessage(assistantMessage.id, true);
    });
    await waitFor(() => {
      expect(result.current.messages[0].rating).toBeUndefined();
      expect(result.current.messages[1].rating).toBe(true);
    });

    mockNextFetchResult({
      status: 204,
      json: {},
    });
    await act(async () => {
      result.current.rateMessage(assistantMessage.id, false);
    });
    await waitFor(() => {
      expect(result.current.messages[0].rating).toBe(undefined);
      expect(result.current.messages[1].rating).toBe(false);
    });
  });
});
