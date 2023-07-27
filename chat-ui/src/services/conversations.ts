import { ConversationState } from "../useConversation";
import { fetchEventSource } from "@microsoft/fetch-event-source";
import type { References } from "chat-core";

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

export function formatReferences(references: References): string {
  if (references.length === 0) {
    return ""
  }
  const heading = "\n\n**Further reading:**\n\n";
  const listOfLinks = references
    .map((entry) => `- [${entry.title}](${entry.url})`)
    .join("\n\n");
  return heading + listOfLinks;
}

class RetriableError<Data extends object = object> extends Error {
  retryAfter: number;
  data?: Data;

  constructor(
    message: string,
    config: { retryAfter?: number; data?: Data } = {}
  ) {
    const { retryAfter = 1000, data } = config;
    super();
    this.name = "RetriableError";
    this.message = message;
    this.retryAfter = retryAfter;
    this.data = data;
  }
}

export default class ConversationService {
  private serverUrl: string;

  constructor(config: ConversationServiceConfig) {
    this.serverUrl = config.serverUrl;
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
      throw new Error(`Bad request: ${data.message}`);
    }
    if (resp.status === 404) {
      throw new Error(`Conversation not found: ${data.message}`);
    }
    if (resp.status === 429) {
      // TODO: Handle rate limiting
      throw new Error(`Rate limited: ${data.message}`);
    }
    if (resp.status >= 500) {
      throw new Error(`Server error: ${data.message}`);
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

        if (
          response.status >= 400 &&
          response.status < 500 &&
          response.status !== 429
        ) {
          // client-side errors are usually non-retriable:
          throw new Error(`Chatbot stream error: ${response.statusText}`);
        } else {
          // other errors are possibly retriable
          throw new RetriableError("Chatbot stream error", {
            retryAfter: 1000,
            data: response,
          });
        }
      },
      onclose() {
        if (moreToStream) {
          throw new RetriableError("Chatbot stream closed unexpectedly");
        }
      },
      onerror(err) {
        console.log("services/conversations/onerror", err);
        if (
          err instanceof RetriableError &&
          moreToStream &&
          retryCount++ < maxRetries
        ) {
          return err.retryAfter;
        }
        if (err instanceof Error) {
          throw new Error(err.message);
        }
        throw err; // rethrow to stop the operation
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
export const conversationService = new ConversationService({
  serverUrl: import.meta.env.VITE_SERVER_BASE_URL,
});
