import { vi } from "vitest";
import {
  AssistantMessageMetadata,
  ConversationFetchOptions,
  ConversationService,
  ConversationStreamEvent,
  DeltaStreamEvent,
  MetadataStreamEvent,
  ReferencesStreamEvent,
  UnknownStreamEvent,
  getCustomRequestOrigin,
} from "./conversations";
import { type References } from "../references";
import * as FetchEventSource from "@microsoft/fetch-event-source";
// Mock fetch for regular awaited HTTP requests
// TODO: make TypeScript compiler ok with this, or skip putting this in the compiled code for staging
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.fetch = vi.fn();

function mockFetchResponse<T = unknown>({
  status = 200,
  data,
}: {
  status?: number;
  data: T;
}) {
  let lastRequestOptions: Partial<ConversationFetchOptions>;
  (global.fetch as ReturnType<typeof vi.fn>).mockImplementation(
    async (_url, options: ConversationFetchOptions) => {
      // Capture the request options
      lastRequestOptions = options;

      return {
        status,
        json: () => Promise.resolve(data),
        // You can add other properties of the Response object if necessary
      };
    }
  );
  return () => lastRequestOptions;
}

// Mock @microsoft/fetch-event-source for SSE streaming requests
vi.mock("@microsoft/fetch-event-source");
declare module "@microsoft/fetch-event-source" {
  export type MockEvent<Data = unknown> = {
    id?: string;
    type?: string;
    data: Data;
  };
  export function __addMockEvents(...newEvents: MockEvent[]): void;
  export function __clearMockEvents(): void;
}

function mockFetchEventSourceResponse<Data = unknown>(
  ...events: FetchEventSource.MockEvent<Data>[]
) {
  FetchEventSource.__clearMockEvents();
  FetchEventSource.__addMockEvents(...events);
  return events;
}

function filterMockedConversationEventsData<
  StreamEvent extends ConversationStreamEvent
>(
  events: FetchEventSource.MockEvent<ConversationStreamEvent>[],
  type: StreamEvent["type"]
): StreamEvent["data"][] {
  return events
    .filter((event) => event.data.type === type)
    .map((event) => (event.data as StreamEvent).data);
}

//Tests
const serverUrl = "https://example.com/api/v1";

describe("ConversationService", () => {
  let conversationService: ConversationService;
  beforeEach(() => {
    conversationService = new ConversationService({
      serverUrl,
    });
  });

  it("throws if serverUrl is not set", () => {
    expect(
      () =>
        new ConversationService({
          serverUrl: undefined as unknown as string,
        })
    ).toThrow("You must define a serverUrl for the ConversationService");
  });

  it("creates conversations", async () => {
    const conversationId = "650b4b260f975ef031016c8a";
    mockFetchResponse({
      data: {
        _id: conversationId,
        messages: [],
        createdAt: new Date().getTime(),
      },
    });
    const conversation = await conversationService.createConversation();
    expect(conversation._id).toEqual(conversationId);
    expect(conversation.messages).toEqual([]);
  });

  it("gets an existing conversation", async () => {
    const conversationId = "65c680decdb62b4c92797323";
    mockFetchResponse({
      data: {
        _id: conversationId,
        messages: [
          {
            id: "65c680decdb62b4c92797324",
            role: "user",
            content: "Hello world!",
            createdAt: new Date().getTime(),
            references: [],
          },
          {
            id: "65c680decdb62b4c92797325",
            role: "assistant",
            content: "I'm sorry, I don't know how to help with that.",
            createdAt: new Date().getTime(),
            references: [
              { title: "Title 1", url: "https://example.com/1" },
              { title: "Title 2", url: "https://example.com/2" },
              { title: "Title 3", url: "https://example.com/3" },
            ],
          },
        ],
        createdAt: new Date().getTime(),
      },
    });
    const conversation = await conversationService.getConversation(
      conversationId
    );
    expect(conversation._id).toEqual(conversationId);
    expect(conversation.messages[0].id).toEqual("65c680decdb62b4c92797324");
    expect(conversation.messages[1].id).toEqual("65c680decdb62b4c92797325");
    expect(conversation.messages[2]).toBeUndefined();
  });

  it("throws if you try to get a conversation with an invalid ID", async () => {
    mockFetchResponse({
      status: 400,
      data: { error: "Invalid conversation ID" },
    });
    expect(async () => {
      return conversationService.getConversation("not-a-real-conversation-id");
    }).rejects.toThrow("Invalid conversation ID");
  });

  it("throws if you try to get a non-existent conversation", async () => {
    mockFetchResponse({
      status: 404,
      data: { error: "Conversation not found" },
    });
    expect(async () => {
      // Assumes 65c689e3ccdb70bebc178017 is not in the database
      return conversationService.getConversation("65c689e3ccdb70bebc178017");
    }).rejects.toThrow("Conversation not found");
  });

  describe("addMessage (awaited)", () => {
    it("adds messages to an existing conversation", async () => {
      const conversationId = "650b4b260f975ef031016c8b";
      const mockMessage = {
        id: "650b4be0d5a57dd66be2ccb8",
        role: "assistant",
        content: "I'm sorry, I don't know how to help with that.",
        createdAt: new Date().getTime(),
        references: [
          { title: "Title 1", url: "https://example.com/1" },
          { title: "Title 2", url: "https://example.com/2" },
          { title: "Title 3", url: "https://example.com/3" },
        ],
      };
      mockFetchResponse({ data: mockMessage });
      const awaitedMessage = await conversationService.addMessage({
        conversationId,
        message: "Hello world!",
      });
      expect(awaitedMessage).toEqual(mockMessage);
    });

    it("creates a new conversation when provided a null conversation ID", async () => {
      const mockMessage = {
        id: "650b4be0d5a57dd66be2ccb9",
        role: "assistant",
        content: "I'm sorry, I don't know how to help with that.",
        createdAt: new Date().getTime(),
        references: [
          { title: "Title 1", url: "https://example.com/1" },
          { title: "Title 2", url: "https://example.com/2" },
          { title: "Title 3", url: "https://example.com/3" },
        ],
      };
      mockFetchResponse({
        data: { ...mockMessage, metadata: { conversationId: "asdf" } },
      });
      const awaitedMessage = await conversationService.addMessage({
        conversationId: "null",
        message: "Hello world!",
      });
      expect(awaitedMessage.content).toEqual(mockMessage.content);
      expect(awaitedMessage.references).toEqual(mockMessage.references);
      expect(awaitedMessage.metadata?.conversationId).toBeDefined();
    });

    it("includes client context (if provided) when adding messages", async () => {
      const conversationId = "650b4b260f975ef031016c8b";
      const mockMessage = {
        id: "650b4be0d5a57dd66be2ccb8",
        role: "assistant",
        content: "I'm sorry, I don't know how to help with that.",
        createdAt: new Date().getTime(),
        references: [],
      };
      const getLastRequestOptions = mockFetchResponse({ data: mockMessage });

      const clientContext = { userId: "123", sessionId: "456" };
      await conversationService.addMessage({
        conversationId,
        message: "Hello world!",
        clientContext,
      });

      const options = getLastRequestOptions();
      const requestBody = JSON.parse(
        (options as unknown as { body: string }).body
      );
      expect(requestBody.clientContext).toEqual(clientContext);
    });
  });

  describe("addMessage (streaming)", () => {
    it("adds messages to an existing conversation", async () => {
      const conversationId = "650b4b260f975ef031016c8c";
      const mockStreamedMessageId = "651466eecffc98fe887000da";

      const mockedEvents =
        mockFetchEventSourceResponse<ConversationStreamEvent>(
          {
            id: undefined,
            type: undefined,
            data: {
              type: "metadata",
              data: {
                verifiedAnswer: {
                  _id: "66060bf9888068d1e6163ac4",
                  updated: new Date("2024-03-26T01:22:12.000Z").toISOString(),
                  created: new Date("2024-01-21T00:31:16.000Z").toISOString(),
                },
              },
            },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "delta", data: "Once upon" },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "delta", data: " a time there was a" },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "delta", data: " very long string." },
          },
          {
            id: undefined,
            type: undefined,
            data: {
              type: "references",
              data: [
                { title: "Title 1", url: "https://example.com/1" },
                { title: "Title 2", url: "https://example.com/2" },
                { title: "Title 3", url: "https://example.com/3" },
              ],
            },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "finished", data: mockStreamedMessageId },
          }
        );

      const streamedMetadata: AssistantMessageMetadata[] = [];
      const streamedTokens: string[] = [];
      const streamedReferences: References[] = [];
      let streamedMessageId: string | undefined;
      let finishedStreaming = false;
      await conversationService.addMessageStreaming({
        conversationId,
        message: "Hello world!",
        maxRetries: 0,
        onResponseDelta: async (data: string) => {
          streamedTokens.push(data);
        },
        onReferences: async (data: References) => {
          streamedReferences.push(data);
        },
        onResponseFinished: async (messageId: string) => {
          streamedMessageId = messageId;
          finishedStreaming = true;
        },
        onMetadata: async (metadata) => {
          streamedMetadata.push(metadata);
        },
      });
      expect(streamedMessageId).toEqual(mockStreamedMessageId);
      expect(streamedTokens).toEqual(
        filterMockedConversationEventsData<DeltaStreamEvent>(
          mockedEvents,
          "delta"
        )
      );
      expect(streamedReferences).toEqual(
        filterMockedConversationEventsData<ReferencesStreamEvent>(
          mockedEvents,
          "references"
        )
      );
      expect(streamedMetadata).toEqual(
        filterMockedConversationEventsData<MetadataStreamEvent>(
          mockedEvents,
          "metadata"
        )
      );
      expect(finishedStreaming).toEqual(true);
    });

    it("creates a new conversation when provided a null conversation ID", async () => {
      const mockStreamedMessageId = "651466eecffc98fe887000db";

      const mockedEvents =
        mockFetchEventSourceResponse<ConversationStreamEvent>(
          {
            id: undefined,
            type: undefined,
            data: {
              type: "metadata",
              data: {
                verifiedAnswer: {
                  _id: "66060bf9888068d1e6163ac5",
                  updated: new Date("2024-03-26T01:22:12.000Z").toISOString(),
                  created: new Date("2024-01-21T00:31:16.000Z").toISOString(),
                },
              },
            },
          },
          {
            id: undefined,
            type: undefined,
            data: {
              type: "metadata",
              data: {
                conversationId: "66060bf9888068d1e6163ac5",
              },
            },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "delta", data: "Once upon" },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "delta", data: " a time there was a" },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "delta", data: " very long string." },
          },
          {
            id: undefined,
            type: undefined,
            data: {
              type: "references",
              data: [
                { title: "Title 1", url: "https://example.com/1" },
                { title: "Title 2", url: "https://example.com/2" },
                { title: "Title 3", url: "https://example.com/3" },
              ],
            },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "finished", data: mockStreamedMessageId },
          }
        );

      const streamedMetadata: AssistantMessageMetadata[] = [];
      const streamedTokens: string[] = [];
      const streamedReferences: References[] = [];
      let streamedConversationId: string | undefined;
      let streamedMessageId: string | undefined;
      let finishedStreaming = false;
      await conversationService.addMessageStreaming({
        conversationId: "null",
        message: "Hello world!",
        maxRetries: 0,
        onMetadata: async (metadata) => {
          streamedMetadata.push(metadata);
          if (metadata.conversationId) {
            streamedConversationId = metadata.conversationId;
          }
        },
        onResponseDelta: async (data: string) => {
          streamedTokens.push(data);
        },
        onReferences: async (data: References) => {
          streamedReferences.push(data);
        },
        onResponseFinished: async (messageId: string) => {
          streamedMessageId = messageId;
          finishedStreaming = true;
        },
      });
      expect(streamedMessageId).toEqual(mockStreamedMessageId);
      expect(streamedTokens).toEqual(
        filterMockedConversationEventsData<DeltaStreamEvent>(
          mockedEvents,
          "delta"
        )
      );
      expect(streamedReferences).toEqual(
        filterMockedConversationEventsData<ReferencesStreamEvent>(
          mockedEvents,
          "references"
        )
      );
      expect(streamedMetadata).toEqual(
        filterMockedConversationEventsData<MetadataStreamEvent>(
          mockedEvents,
          "metadata"
        )
      );
      expect(streamedConversationId).toBeDefined();
      expect(finishedStreaming).toEqual(true);
    });

    it("includes client context (if provided) when streaming messages", async () => {
      const conversationId = "650b4b260f975ef031016c8c";
      const mockStreamedMessageId = "651466eecffc98fe887000da";
      const clientContext = { userId: "123", sessionId: "456" };

      mockFetchEventSourceResponse<ConversationStreamEvent>(
        {
          id: undefined,
          type: undefined,
          data: { type: "delta", data: "Hello" },
        },
        {
          id: undefined,
          type: undefined,
          data: { type: "finished", data: mockStreamedMessageId },
        }
      );

      let lastRequestOptions: { body: string } = { body: "" };
      (FetchEventSource.fetchEventSource as jest.Mock).mockImplementation(
        async (_url, options) => {
          lastRequestOptions = options;
          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "text/event-stream" }),
          };
        }
      );

      await conversationService.addMessageStreaming({
        conversationId,
        message: "Hello world!",
        clientContext,
        maxRetries: 0,
        onResponseDelta: () => undefined,
        onResponseFinished: () => undefined,
        onReferences: () => undefined,
        onMetadata: () => undefined,
      });

      const requestBody = JSON.parse(lastRequestOptions.body);
      expect(requestBody.clientContext).toEqual(clientContext);
    });

    it("gracefully handles unknown stream event types", async () => {
      const conversationId = "650b4b260f975ef031016c8d";
      type PotentiallyUnknownStreamEvent =
        | ConversationStreamEvent
        | UnknownStreamEvent;
      const mockedEvents =
        mockFetchEventSourceResponse<PotentiallyUnknownStreamEvent>(
          {
            id: undefined,
            type: undefined,
            data: { type: "unknown123", data: "Hello world!" },
          },
          {
            id: undefined,
            type: undefined,
            data: {
              type: "delta",
              data: "Once upon a time there was a very long string.",
            },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "unknownABC", data: null },
          },
          {
            id: undefined,
            type: undefined,
            data: {
              type: "references",
              data: [
                { title: "Title 1", url: "https://example.com/1" },
                { title: "Title 2", url: "https://example.com/2" },
              ],
            },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "unknown", data: 42 },
          },
          {
            id: undefined,
            type: undefined,
            data: { type: "finished", data: "650b4be0d5a57dd66be2ccb9" },
          }
        );

      const deltas: string[] = [];
      const references: References[] = [];
      const metadatas: AssistantMessageMetadata[] = [];
      let streamedMessageId: string | undefined;
      let finishedStreaming = false;

      // Mock the fetchEventSource implementation to process our events
      (FetchEventSource.fetchEventSource as jest.Mock).mockImplementation(
        async (_url, options) => {
          const { onmessage } = options;
          // Process each event through the onmessage handler
          for (const event of mockedEvents) {
            await onmessage({ data: JSON.stringify(event.data) });
          }
          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "text/event-stream" }),
          };
        }
      );

      await conversationService.addMessageStreaming({
        conversationId,
        message: "Hello world!",
        maxRetries: 0,
        onResponseDelta: async (data: string) => {
          console.log("onResponseDelta", data);
          deltas.push(data);
        },
        onResponseFinished: async (messageId: string) => {
          console.log("onResponseFinished", messageId);
          streamedMessageId = messageId;
          finishedStreaming = true;
        },
        onReferences: async (refs) => {
          console.log("onReferences", refs);
          references.push(refs);
        },
        onMetadata: async (metadata) => {
          console.log("onMetadata", metadata);
          metadatas.push(metadata);
        },
      });

      // Filter out unknown events and only keep valid conversation events
      const validEvents = mockedEvents.filter(
        (event): event is FetchEventSource.MockEvent<ConversationStreamEvent> =>
          event.data.type === "delta" ||
          event.data.type === "references" ||
          event.data.type === "metadata" ||
          event.data.type === "finished"
      );

      expect(deltas).toEqual(
        filterMockedConversationEventsData<DeltaStreamEvent>(
          validEvents,
          "delta"
        )
      );

      expect(references).toEqual(
        filterMockedConversationEventsData<ReferencesStreamEvent>(
          validEvents,
          "references"
        )
      );

      expect(metadatas).toEqual(
        filterMockedConversationEventsData<MetadataStreamEvent>(
          validEvents,
          "metadata"
        )
      );

      expect(streamedMessageId).toEqual("650b4be0d5a57dd66be2ccb9");
      expect(finishedStreaming).toEqual(true);
    });
  });

  it("rates messages", async () => {
    const conversationId = "650b4b260f975ef031016c8d";
    const ratedMessageId = "650b4be0d5a57dd66be2ccb9";
    const rating = true;
    mockFetchResponse({ status: 204, data: undefined });
    const savedRating = await conversationService.rateMessage({
      conversationId,
      messageId: ratedMessageId,
      rating,
    });
    expect(savedRating).toEqual(rating);
  });

  it("supports user comments on messages", async () => {
    const conversationId = "650b4b260f975ef031016c8d";
    const ratedMessageId = "650b4be0d5a57dd66be2ccb9";
    const comment = "This was a satisfying response.";
    mockFetchResponse({ status: 204, data: undefined });
    const commentPromise = conversationService.commentMessage({
      conversationId,
      messageId: ratedMessageId,
      comment,
    });
    expect(commentPromise).resolves.toBeUndefined();
  });

  it("throws on invalid inputs", async () => {
    const conversationId = "650b4b260f975ef031016c8d";
    const messageId = "650b4be0d5a57dd66be2ccb9";
    const invalidRatingErrorMessage = "Invalid rating";

    mockFetchResponse({
      status: 400,
      data: { error: invalidRatingErrorMessage },
    });

    expect(async () => {
      return conversationService.rateMessage({
        conversationId,
        messageId,
        rating: "true" as unknown as boolean,
      });
    }).rejects.toThrow(invalidRatingErrorMessage);

    const invalidCommentErrorMessage = "Failed to save comment on message";
    mockFetchResponse({
      status: 400,
      data: { error: invalidCommentErrorMessage },
    });

    expect(async () => {
      return conversationService.commentMessage({
        conversationId,
        messageId,
        comment: 42 as unknown as string,
      });
    }).rejects.toThrow(invalidCommentErrorMessage);

    const invalidConversationIdErrorMessage = "Invalid conversation ID";
    mockFetchResponse({
      status: 400,
      data: { error: invalidConversationIdErrorMessage },
    });
    expect(async () => {
      return conversationService.rateMessage({
        conversationId: "abcdefg this is not ObjectId",
        messageId,
        rating: true,
      });
    }).rejects.toThrow(invalidConversationIdErrorMessage);
  });

  it("throws on server errors", async () => {
    const conversationId = "650b4b260f975ef031016c8d";
    const messageId = "650b4be0d5a57dd66be2ccb9";
    const internalServerErrorMessage = "Internal server error";

    mockFetchResponse({
      status: 500,
      data: { error: internalServerErrorMessage },
    });

    expect(async () => {
      return conversationService.addMessage({
        conversationId,
        message: "Hello world!",
      });
    }).rejects.toThrow(internalServerErrorMessage);

    expect(async () => {
      return conversationService.rateMessage({
        conversationId,
        messageId,
        rating: true,
      });
    }).rejects.toThrow(internalServerErrorMessage);
  });

  describe("fetchOptions", () => {
    it("supports static fetchOptions", async () => {
      const conversationService = new ConversationService({
        serverUrl,
        fetchOptions: {
          headers: new Headers({
            foo: "bar",
          }),
          credentials: "include",
        },
      });
      let getOptions = mockFetchResponse({
        data: {
          _id: "650b4b260f975ef031016c8d",
          messages: [],
          createdAt: new Date().getTime(),
        },
      });
      await conversationService.createConversation();
      const createOptions = getOptions();
      const createOptionsHeaders = new Headers(createOptions.headers);

      expect(createOptionsHeaders.get("foo")).toBe("bar");
      expect(createOptionsHeaders.get("content-type")).toBe("application/json");
      expect(createOptions.credentials).toBe("include");

      await conversationService.addMessage({ conversationId: "", message: "" });
      const addOptions = getOptions();
      const addOptionsHeaders = new Headers(addOptions.headers);
      expect(addOptionsHeaders.get("foo")).toBe("bar");
      expect(addOptionsHeaders.get("content-type")).toBe("application/json");
      expect(addOptions.credentials).toBe("include");

      await conversationService.addMessageStreaming({
        conversationId: "",
        message: "",
        onResponseDelta: vi.fn(),
        onResponseFinished: vi.fn(),
        onReferences: vi.fn(),
        onMetadata: vi.fn(),
      });
      const addStreamingOptions = getOptions();
      const addStreamingOptionsHeaders = new Headers(
        addStreamingOptions.headers
      );
      expect(addStreamingOptionsHeaders.get("foo")).toBe("bar");
      expect(addStreamingOptionsHeaders.get("content-type")).toBe(
        "application/json"
      );
      expect(addStreamingOptions.credentials).toBe("include");

      // Updating the mock fetch to return 204, which is used by the following two calls.
      getOptions = mockFetchResponse({ data: {}, status: 204 });
      await conversationService.rateMessage({
        conversationId: "a",
        messageId: "b",
        rating: true,
      });
      const ratingOptions = getOptions();
      const ratingOptionsHeaders = new Headers(ratingOptions.headers);
      expect(ratingOptionsHeaders.get("foo")).toBe("bar");
      expect(ratingOptionsHeaders.get("content-type")).toBe("application/json");
      expect(ratingOptions.credentials).toBe("include");

      await conversationService.commentMessage({
        conversationId: "",
        comment: "",
        messageId: "",
      });
      const commentOptions = getOptions();
      const commentOptionsHeaders = new Headers(commentOptions.headers);
      expect(commentOptionsHeaders.get("foo")).toBe("bar");
      expect(commentOptionsHeaders.get("content-type")).toBe(
        "application/json"
      );
      expect(commentOptions.credentials).toBe("include");
    });

    it("generates new headers on every request with dynamic fetchOptions", async () => {
      let callCount = 0;
      const conversationService = new ConversationService({
        serverUrl,
        fetchOptions: () => ({
          headers: new Headers({
            foo: `dynamic-${++callCount}`,
          }),
          credentials: "include",
        }),
      });
      let getOptions = mockFetchResponse({
        data: {
          _id: "650b4b260f975ef031016c8d",
          messages: [],
          createdAt: new Date().getTime(),
        },
      });
      await conversationService.createConversation();
      const createOptions = getOptions();
      const createOptionsHeaders = new Headers(createOptions.headers);

      expect(createOptionsHeaders.get("foo")).toBe("dynamic-1");
      expect(createOptionsHeaders.get("content-type")).toBe("application/json");
      expect(createOptions.credentials).toBe("include");

      await conversationService.addMessage({ conversationId: "", message: "" });
      const addOptions = getOptions();
      const addOptionsHeaders = new Headers(addOptions.headers);
      expect(addOptionsHeaders.get("foo")).toBe("dynamic-2");
      expect(addOptionsHeaders.get("content-type")).toBe("application/json");
      expect(addOptions.credentials).toBe("include");

      // For addMessageStreaming, we need to mock fetchEventSource to capture headers
      let streamingOptions: Partial<FetchEventSource.FetchEventSourceInit>;
      (FetchEventSource.fetchEventSource as jest.Mock).mockImplementation(
        async (_url, options) => {
          streamingOptions = options;
          return {
            ok: true,
            status: 200,
            headers: new Headers({ "content-type": "text/event-stream" }),
          };
        }
      );

      await conversationService.addMessageStreaming({
        conversationId: "",
        message: "",
        onResponseDelta: vi.fn(),
        onResponseFinished: vi.fn(),
        onReferences: vi.fn(),
        onMetadata: vi.fn(),
      });

      // Check the headers from fetchEventSource
      expect(streamingOptions.headers.foo).toBe("dynamic-3");
      expect(streamingOptions.headers["content-type"]).toBe("application/json");
      expect(streamingOptions.credentials).toBe("include");

      // Updating the mock fetch to return 204, which is used by the following two calls.
      getOptions = mockFetchResponse({ data: {}, status: 204 });
      await conversationService.rateMessage({
        conversationId: "a",
        messageId: "b",
        rating: true,
      });
      const ratingOptions = getOptions();
      const ratingOptionsHeaders = new Headers(ratingOptions.headers);
      expect(ratingOptionsHeaders.get("foo")).toBe("dynamic-4");
      expect(ratingOptionsHeaders.get("content-type")).toBe("application/json");
      expect(ratingOptions.credentials).toBe("include");

      await conversationService.commentMessage({
        conversationId: "",
        comment: "",
        messageId: "",
      });
      const commentOptions = getOptions();
      const commentOptionsHeaders = new Headers(commentOptions.headers);
      expect(commentOptionsHeaders.get("foo")).toBe("dynamic-5");
      expect(commentOptionsHeaders.get("content-type")).toBe(
        "application/json"
      );
      expect(commentOptions.credentials).toBe("include");
    });
  });
});

describe("getCustomRequestOrigin", () => {
  it("returns the current window location if it exists", () => {
    const mockWindowLocation = "https://example.com/foo/bar";
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = {
      ...global.window,
      location: {
        ...global.window.location,
        href: mockWindowLocation,
      },
    };
    expect(getCustomRequestOrigin()).toEqual(mockWindowLocation);
  });

  it("returns null if the current window location does not exist", () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (global as any).window = undefined;
    expect(getCustomRequestOrigin()).toEqual(undefined);
  });
});
