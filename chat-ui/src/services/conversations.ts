import { ConversationState } from "../useConversation";
import { fetchEventSource } from "@microsoft/fetch-event-source";

export type Role = "user" | "assistant";

export type MessageData = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  rating?: boolean;
};

type ConversationServiceConfig = {
  serverUrl: string;
};

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
    const resolvedUrl = this.serverUrl + path;
    const queryString = new URLSearchParams(queryParams).toString();
    if (!queryString) {
      return resolvedUrl;
    }
    return `${resolvedUrl}?${queryString}`
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
    return data;
  }

  async addMessageStreaming({
    conversationId,
    message,
    onStreamEvent,
  }: {
    conversationId: string;
    message: string;
    onStreamEvent: (data: string) => void;
  }): Promise<void> {
    const path = `/conversations/${conversationId}/messages`;
    await fetchEventSource(this.getUrl(path, { stream: "true" }), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
      onmessage(ev) {
        const formattedData = ev.data.replaceAll(`\\n`, `\n`)
        onStreamEvent(formattedData);
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
