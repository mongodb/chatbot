import { ApiConversationState } from "../useApiConversation";
import { strict as assert } from "node:assert";

export type Role = "user" | "assistant";

export type ApiMessageData = {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
  rating?: boolean;
  suggestedPrompts?: string[];
};

export class TimeoutError<Data extends object = object> extends Error {
  data?: Data;

  constructor(message: string) {
    super(message);
    this.name = "TimeoutError";
    this.message = message;
  }
}

export type ApiConversationServiceConfig = {
  serverUrl: string;
  apiCredentials: Record<string, Record<string, string>>;
};

export class ApiConversationService {
  private apiCredentials: Record<string, Record<string, string>>;
  private serverUrl: string;

  constructor(config: ApiConversationServiceConfig) {
    assert(
      config.serverUrl,
      "You must define a serverUrl for the ApiConversationService"
    );
    this.apiCredentials = config.apiCredentials;
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
        `Invalid path: ${path} - ApiConversationService paths must start with /`
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

  async createConversation(): Promise<Required<ApiConversationState>> {
    const path = `/api-conversations`;
    console.log("createConversation :: calling", this.getUrl(path));
    const resp = await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("createConversation :: response status", resp.status);
    const conversation = await resp.json();
    console.log("createConversation :: conversation", conversation);
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
  }): Promise<ApiMessageData> {
    const path = `/api-conversations/${conversationId}/messages`;
    const resp = await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        apiCredentials: this.apiCredentials,
      }),
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

  async rateMessage({
    conversationId,
    messageId,
    rating,
  }: {
    conversationId: string;
    messageId: string;
    rating: boolean;
  }): Promise<boolean> {
    const path = `/api-conversations/${conversationId}/messages/${messageId}/rating`;
    const res = await fetch(this.getUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
}
