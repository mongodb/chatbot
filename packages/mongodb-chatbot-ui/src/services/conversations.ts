import { fetchEventSource } from "@microsoft/fetch-event-source";
import { type VerifiedAnswer } from "../verifiedAnswer";
import { type References } from "../references";
import { strict as assert } from "node:assert";
import { nonProd } from "../utils";

export type Role = "user" | "assistant";

export type MessageData = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  rating?: boolean;
  references?: References;
  suggestedPrompts?: string[];
  metadata?: AssistantMessageMetadata;
};

export type AssistantMessageMetadata = {
  [k: string]: unknown;

  /**
    The conversation ID that this message is part of. If you add a message
    without specifying a conversation ID, which creates a new conversation, this
    field contains the ID of the new conversation.
  */
  conversationId?: string;

  /**
    If the message came from the verified answers collection, contains the
    metadata about the verified answer.
  */
  verifiedAnswer?: {
    _id: VerifiedAnswer["_id"];
    created: string;
    updated: string | undefined;
  };
};

export type ConversationData = {
  _id: string;
  messages: MessageData[];
  createdAt: number;
};

function asConversationData(data: Record<string, unknown>): ConversationData {
  if (!(typeof data._id === "string")) {
    throw new Error("Invalid conversation data: _id must be a string");
  }
  if (!Array.isArray(data.messages)) {
    throw new Error("Invalid conversation data: messages must be an array");
  }
  if (
    !(typeof data.createdAt === "number") ||
    new Date(data.createdAt).getTime() !== data.createdAt
  ) {
    throw new Error(
      `Invalid conversation data: createdAt must be a valid datetime number. Got ${data.createdAt}`
    );
  }

  return {
    _id: data._id,
    messages: data.messages,
    createdAt: data.createdAt,
  } satisfies ConversationData;
}

export const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";

export function getCustomRequestOrigin() {
  if (typeof window !== "undefined") {
    return window.location.href;
  }
  return undefined;
}

export class RetriableError<Data extends object = object> extends Error {
  retryAfter: number;
  data?: Data;

  constructor(
    message: string,
    config: { retryAfter?: number; data?: Data } = {}
  ) {
    const { retryAfter = 1000, data } = config;
    super(message);
    this.name = "RetriableError";
    this.message = message;
    this.retryAfter = retryAfter;
    this.data = data;
  }
}

export class TimeoutError<Data extends object = object> extends Error {
  data?: Data;

  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
    this.message = message;
  }
}

export type UnknownStreamEvent = { type: string; data: unknown };

function isSomeStreamEvent(event: object): event is UnknownStreamEvent {
  const e = event as UnknownStreamEvent;
  return typeof e.type === "string" && typeof e.data !== "undefined";
}

export type DeltaStreamEvent = { type: "delta"; data: string };
export type ReferencesStreamEvent = { type: "references"; data: References };
export type MetadataStreamEvent = {
  type: "metadata";
  data: AssistantMessageMetadata;
};
export type FinishedStreamEvent = { type: "finished"; data: string };

export type ConversationStreamEvent =
  | DeltaStreamEvent
  | ReferencesStreamEvent
  | MetadataStreamEvent
  | FinishedStreamEvent;

const isConversationStreamEventType = (
  type: string
): type is ConversationStreamEvent["type"] => {
  return (
    type === "delta" ||
    type === "references" ||
    type === "metadata" ||
    type === "finished"
  );
};

const isConversationStreamEvent = (
  event: object
): event is ConversationStreamEvent => {
  const e = event as ConversationStreamEvent;
  return (
    (e.type === "delta" && typeof e.data === "string") ||
    (e.type === "references" && typeof e.data === "object") ||
    (e.type === "metadata" && typeof e.data === "object") ||
    (e.type === "finished" && typeof e.data === "string")
  );
};

/**
  Options to include with every fetch request made by the ConversationService.
  This can be used to set headers, etc.
 */
export type ConversationFetchOptions = Omit<
  RequestInit,
  "body" | "method" | "headers" | "signal"
> & {
  headers?: Headers;
};

export type ConversationServiceConfig = {
  serverUrl: string;
  fetchOptions?: ConversationFetchOptions;
};

export class ConversationService {
  private serverUrl: string;
  private fetchOptions: ConversationFetchOptions & { headers: Headers };

  constructor(config: ConversationServiceConfig) {
    assert(
      config.serverUrl,
      "You must define a serverUrl for the ConversationService"
    );
    this.serverUrl = config.serverUrl.startsWith("/")
      ? new URL(
          config.serverUrl,
          window.location.protocol + "//" + window.location.host
        ).href
      : config.serverUrl;

    const defaultHeaders = new Headers({
      "Content-Type": "application/json",
      [`${CUSTOM_REQUEST_ORIGIN_HEADER}`]: getCustomRequestOrigin() ?? "",
    });

    this.fetchOptions = {
      ...(config.fetchOptions ?? {}),
      headers: this.mergeHeaders(
        defaultHeaders,
        config.fetchOptions?.headers
          ? new Headers(config.fetchOptions?.headers)
          : new Headers()
      ),
    };
  }

  private mergeHeaders(headers1: Headers, headers2: Headers): Headers {
    const mergedHeaders = new Headers();

    // Append headers from the first Headers object
    for (const [key, value] of headers1.entries()) {
      mergedHeaders.append(key, value);
    }

    // Append headers from the second Headers object, adding to existing or creating new entries
    for (const [key, value] of headers2.entries()) {
      mergedHeaders.append(key, value);
    }
    return mergedHeaders;
  }

  private getUrl(path: string, queryParams: Record<string, string> = {}) {
    if (!path.startsWith("/")) {
      throw new Error(
        `Invalid path: ${path} - ConversationService paths must start with /`
      );
    }
    const url = new URL(
      path.replace(/^\/?/, ""), // Strip leading slash (if present) to not clobber baseUrl path
      this.serverUrl.replace(/\/?$/, "/") // Add trailing slash to not lose last segment of baseUrl
    );
    const queryString = new URLSearchParams(queryParams).toString();
    if (!queryString) {
      return url.toString();
    }
    return `${url}?${queryString}`;
  }

  async createConversation(): Promise<ConversationData> {
    const path = `/conversations`;
    const resp = await fetch(this.getUrl(path), {
      ...this.fetchOptions,
      method: "POST",
    });
    const conversation = await resp.json();
    if (resp.status === 400) {
      throw new Error(`Bad request: ${conversation.error}`);
    }
    if (resp.status === 429) {
      // TODO: Handle rate limiting
      throw new Error(`Rate limited: ${conversation.error}`);
    }
    if (resp.status >= 500) {
      throw new Error(`Server error: ${conversation.error}`);
    }
    return asConversationData(conversation);
  }

  async getConversation(conversationId: string): Promise<ConversationData> {
    const path = `/conversations/${conversationId}`;
    const resp = await fetch(this.getUrl(path), this.fetchOptions);
    if (resp.status === 404) {
      throw new Error(`Conversation not found: ${conversationId}`);
    }
    const conversation = await resp.json();
    if (resp.status !== 200) {
      throw new Error(`Failed to fetch conversation: ${conversation.error}`);
    }
    return asConversationData(conversation);
  }

  async addMessage({
    conversationId,
    message,
  }: {
    conversationId: string;
    message: string;
  }): Promise<MessageData> {
    const path = `/conversations/${conversationId}/messages`;
    const resp = await fetch(this.getUrl(path), {
      ...this.fetchOptions,
      method: "POST",
      body: JSON.stringify({ message }),
    });
    const data = await resp.json();
    if (resp.status === 400) {
      throw new Error(data.error);
    }
    if (resp.status === 404) {
      throw new Error(`Conversation not found: ${data.error}`);
    }
    if (resp.status === 429) {
      throw new Error(`Rate limited: ${data.error}`);
    }
    if (resp.status === 504) {
      throw new TimeoutError(data.error);
    }
    if (resp.status >= 500) {
      throw new Error(`Server error: ${data.error}`);
    }
    return data;
  }

  async addMessageStreaming({
    conversationId,
    message,
    maxRetries = 0,
    onResponseDelta,
    onReferences,
    onMetadata,
    onResponseFinished,
    signal,
  }: {
    conversationId: string;
    message: string;
    maxRetries?: number;
    onResponseDelta: (delta: string) => void;
    onReferences: (references: References) => void;
    onMetadata: (metadata: AssistantMessageMetadata) => void;
    onResponseFinished: (messageId: string) => void;
    signal?: AbortSignal;
  }): Promise<void> {
    const path = `/conversations/${conversationId}/messages`;

    let retryCount = 0;
    let moreToStream = true;

    await fetchEventSource(this.getUrl(path, { stream: "true" }), {
      ...this.fetchOptions,
      // Need to convert Headers to plain object for fetchEventSource
      headers: Object.fromEntries(this.fetchOptions.headers),
      signal: signal ?? null,
      method: "POST",
      body: JSON.stringify({ message }),
      openWhenHidden: true,

      onmessage(ev) {
        const event = JSON.parse(ev.data);
        if (!isSomeStreamEvent(event)) {
          nonProd(() => {
            console.error(
              `Received an unknown event: ${JSON.stringify(event)}`
            );
          });
          return;
        }
        if (!isConversationStreamEventType(event.type)) {
          nonProd(() => {
            console.error(`Received an unknown event type: ${event.type}`);
          });
          return;
        }
        if (!isConversationStreamEvent(event)) {
          nonProd(() => {
            console.error(
              `Received an invalid conversation event: ${JSON.stringify(event)}`
            );
          });
          return;
        }
        switch (event.type) {
          case "delta": {
            const formattedData = event.data.replaceAll(`\\n`, `\n`);
            onResponseDelta(formattedData);
            break;
          }
          case "references": {
            onReferences(event.data);
            break;
          }
          case "metadata": {
            onMetadata(event.data);
            break;
          }
          case "finished": {
            moreToStream = false;
            const messageId = event.data;
            onResponseFinished(messageId);
            break;
          }
        }
      },

      async onopen(response) {
        if (
          response.ok &&
          response.headers.get("content-type") === "text/event-stream"
        ) {
          return; // everything's good
        }

        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.error ?? `Bad request`);
        }

        if (
          response.status > 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          // client-side errors are usually non-retriable:
          throw new Error(`Chatbot stream error: ${response.statusText}`);
        } else {
          // other errors are possibly retriable
          throw new RetriableError(
            `Chatbot stream error: ${response.statusText}`,
            {
              retryAfter: 1000,
              data: response,
            }
          );
        }
      },
      onclose() {
        if (moreToStream) {
          throw new RetriableError("Chatbot stream closed unexpectedly");
        }
      },
      onerror(err) {
        if (err instanceof RetriableError) {
          if (moreToStream && retryCount++ < maxRetries) {
            return err.retryAfter;
          }
          // Past this point we no longer want to retry, so
          // rethrow to stop the operation and let the error
          // bubble up to the caller.
          if (!err.data) {
            throw new Error(err.message);
          }

          if (err.data instanceof Response) {
            const errorBodyPromise = err.data.json() as Promise<{
              error: string;
            }>;
            errorBodyPromise.then((errorBody) => {
              throw new Error(errorBody.error);
            });
          } else {
            throw new Error(err.message);
          }
        } else if (err instanceof Error) {
          throw new Error(err.message);
        }
        throw err;
      },
    });
  }

  async rateMessage({
    conversationId,
    messageId,
    rating,
  }: {
    conversationId: string;
    messageId: string;
    rating: boolean;
  }): Promise<boolean> {
    const path = `/conversations/${conversationId}/messages/${messageId}/rating`;
    const res = await fetch(this.getUrl(path), {
      ...this.fetchOptions,
      method: "POST",
      body: JSON.stringify({ rating }),
    });

    if (res.status === 204) {
      return rating;
    }
    if (res.status >= 400) {
      const data = await res.json();
      throw new Error(data.error);
    }
    throw new Error(
      `Server encountered an unexpected status: ${res.status} (message: ${res.statusText})`
    );
  }

  async commentMessage({
    conversationId,
    messageId,
    comment,
  }: {
    conversationId: string;
    messageId: string;
    comment: string;
  }): Promise<void> {
    const path = `/conversations/${conversationId}/messages/${messageId}/comment`;
    const res = await fetch(this.getUrl(path), {
      ...this.fetchOptions,
      method: "POST",
      body: JSON.stringify({ comment }),
    });

    if (res.status === 204) {
      return;
    }
    if (res.status >= 400) {
      const data = await res.json();
      throw new Error(data.error);
    }
    throw new Error(
      `Server encountered an unexpected status: ${res.status} (message: ${res.statusText})`
    );
  }
}
