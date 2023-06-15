export type Role = "user" | "assistant" | "system";

export type MessageData = {
  id: string;
  role: Role;
  content: string;
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

  private getUrl(path: string) {
    if (!path.startsWith("/")) {
      throw new Error(
        `Invalid path: ${path} - ConversationService paths must start with /`
      );
    }
    return this.serverUrl + path;
  }

  async createConversation() {
    const path = `/conversations`;
    const resp = await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await resp.json();
    return data;
  }

  async addMessage({
    conversationId,
    message,
  }: {
    conversationId: string;
    message: MessageData;
  }) {
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

  async rateMessage({
    conversationId,
    messageId,
    rating,
  }: {
    conversationId: string;
    messageId: string;
    rating: boolean;
  }) {
    const path = `/conversations/${conversationId}/messages/${messageId}/rating}`;
    const resp = await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rating }),
    });
    const data = await resp.json();
    return data;
  }
}

export const conversationService = new ConversationService({
  serverUrl: "http://localhost:3000",
});
