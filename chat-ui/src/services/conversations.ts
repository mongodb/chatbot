import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { References } from "chat-core";
import { ConversationState } from "../useConversation";

export type Role = "user" | "assistant";

export type MessageData = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  rating?: boolean;
  references?: References;
};

type ConversationServiceConfig = {
  serverUrl: string;
};

export function formatReferencesTokens(references: References): string[] {
  if (references.length === 0) {
    return [];
  }
  const heading = "\n\n**Further reading:**\n\n";
  const listOfLinks = references.map(
    (entry) => `- [${entry.title}](${entry.url})`
  );
  return [heading, ...listOfLinks];
}

export function formatReferences(references: References): string {
  return formatReferencesTokens(references).join("\n\n");
}

class RetriableError<Data extends object = object> extends Error {
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

export class ConversationService {
  private serverUrl: string;

  constructor(config: ConversationServiceConfig) {
    this.serverUrl = config.serverUrl.startsWith("/")
      ? new URL(
          config.serverUrl,
          window.location.protocol + "//" + window.location.host
        ).href
      : config.serverUrl;
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

  async createConversation(): Promise<Required<ConversationState>> {
    const path = `/conversations`;
    const resp = await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    return {
      ...conversation,
      conversationId: conversation._id,
    };
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
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
    onResponseFinished,
    signal,
  }: {
    conversationId: string;
    message: string;
    maxRetries: number;
    onResponseDelta: (delta: string) => void;
    onReferences: (references: References) => void;
    onResponseFinished: (messageId: string) => void;
    signal?: AbortSignal;
  }): Promise<void> {
    const path = `/conversations/${conversationId}/messages`;

    let retryCount = 0;
    let moreToStream = true;

    type ConversationStreamEvent =
      | { type: "delta"; data: string }
      | { type: "references"; data: References }
      | { type: "finished"; data: string };

    const isConversationStreamEvent = (
      event: object
    ): event is ConversationStreamEvent => {
      const e = event as ConversationStreamEvent;
      return (
        (e.type === "delta" && typeof e.data === "string") ||
        (e.type === "references" && typeof e.data === "object") ||
        (e.type === "finished" && typeof e.data === "string")
      );
    };

    await fetchEventSource(this.getUrl(path, { stream: "true" }), {
      signal: signal ?? null,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),

      onmessage(ev) {
        const event = JSON.parse(ev.data);
        if (!isConversationStreamEvent(event)) {
          throw new Error(`Invalid event received from server: ${ev.data}`);
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
  }): Promise<void> {
    const path = `/conversations/${conversationId}/messages/${messageId}/rating`;
    await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating }),
    });
  }
}
