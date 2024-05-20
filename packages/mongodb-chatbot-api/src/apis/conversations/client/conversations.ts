import { fetchEventSource } from "@microsoft/fetch-event-source";
import { assert, mergeHeaders, createTypeGuard } from "../../../utils";
import { RetriableError } from "../../../errors";
import {
  AssistantMessage,
  AssistantMessageMetadata,
  Conversation,
  ConversationStreamEvent,
  Message,
  type References,
} from "../types";
import { makeGetEndpointUrl, parseResponse } from "../../../utils";
import { z } from "zod";

export const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";

export function getCustomRequestOrigin() {
  return typeof window !== "undefined" ? window.location?.href : undefined;
}

export type CreateConversation = () => Promise<Conversation>;

export type GetConversationArgs = {
  conversationId: string;
};

export type GetConversation = (args: GetConversationArgs) => Promise<Conversation>;

export type AddMessageArgs = {
  conversationId: string;
  message: string;
};

export type AddMessage = (args: AddMessageArgs) => Promise<AssistantMessage>;

export type AddMessageStreamingArgs = AddMessageArgs & {
  maxRetries?: number;
  onResponseDelta: (delta: string) => void;
  onReferences: (references: References) => void;
  onMetadata: (metadata: AssistantMessageMetadata) => void;
  onResponseFinished: (messageId: string) => void;
  signal?: AbortSignal;
};

export type AddMessageStreaming = (args: AddMessageStreamingArgs) => Promise<void>;

export type RateMessageArgs = {
  conversationId: string;
  messageId: string;
  rating: boolean;
};

export type RateMessage = (args: RateMessageArgs) => Promise<boolean>;

export type CommentMessageArgs = {
  conversationId: string;
  messageId: string;
  comment: string;
};

export type CommentMessage = (args: CommentMessageArgs) => Promise<void>;

export type ConversationActions = {
  createConversation: CreateConversation;
  getConversation: GetConversation;
  addMessage: AddMessage;
  addMessageStreaming: AddMessageStreaming;
  rateMessage: RateMessage;
  commentMessage: CommentMessage;
};

export type ConversationsClient = ConversationActions;

/**
  Options to include with every fetch request made by the ConversationsClient.
  This can be used to set headers, etc.
 */
export type ConversationsClientFetchOptions = Omit<
  ConversationActionFetchOptions,
  "body"
> & {
  headers?: RequestInit["headers"];
};

export type ConversationActionFetchOptions = Omit<
  RequestInit,
  "method" | "headers" | "signal"
>;

export type ConversationsClientConfig = {
  serverUrl: string;
  fetchOptions?: ConversationsClientFetchOptions;
};

export function makeConversationsClient(
  config: ConversationsClientConfig
): ConversationsClient {
  assert(config.serverUrl, "You must define a serverUrl for the ConversationsClient");
  const baseUrl = config.serverUrl.startsWith("/")
    ? new URL(config.serverUrl, window.location.protocol + "//" + window.location.host)
        .href
    : config.serverUrl;

  const defaultHeaders = new Headers({
    "Content-Type": "application/json",
    [`${CUSTOM_REQUEST_ORIGIN_HEADER}`]: getCustomRequestOrigin() ?? "",
  });

  const fetchOptions = {
    ...(config.fetchOptions ?? {}),
    headers: mergeHeaders(
      defaultHeaders,
      config.fetchOptions?.headers
        ? new Headers(config.fetchOptions?.headers)
        : new Headers()
    ),
  } satisfies ConversationsClientFetchOptions;

  const getEndpointUrl = makeGetEndpointUrl(baseUrl);

  type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "OPTIONS" | "HEAD";

  type HttpPath = `/${string}`;

  async function fetchEndpoint<T>(
    endpoint: `${HttpMethod} ${HttpPath}`,
    options: ConversationActionFetchOptions & {
      validate?: (t: unknown) => t is T;
    } = {}
  ): Promise<T> {
    const [method, ...pathParts] = endpoint.split(" ");
    const path = pathParts.join(" ");
    const resp = await fetch(getEndpointUrl(path), {
      ...fetchOptions,
      ...options,
      method,
    });
    return await parseResponse<T>(resp);
  }

  const createConversation: CreateConversation = async () => {
    return await fetchEndpoint<Conversation>(`POST /conversations`, {
      validate: createTypeGuard(Conversation),
    });
  };

  const getConversation: GetConversation = async ({ conversationId }) => {
    return await fetchEndpoint<Conversation>(`GET /conversations/${conversationId}`, {
      validate: createTypeGuard(Conversation),
    });
  };

  const addMessage: AddMessage = async ({ conversationId, message }) => {
    return await fetchEndpoint<AssistantMessage>(
      `POST /conversations/${conversationId}/messages`,
      {
        body: JSON.stringify({ message }),
        validate: createTypeGuard(Message),
      }
    );
  };

  const addMessageStreaming: AddMessageStreaming = async ({
    conversationId,
    message,
    maxRetries = 0,
    onResponseDelta,
    onReferences,
    onMetadata,
    onResponseFinished,
    signal,
  }) => {
    const path = `/conversations/${conversationId}/messages`;

    let retryCount = 0;
    let moreToStream = true;

    const endpointUrl = getEndpointUrl(path, { stream: "true" });

    await fetchEventSource(endpointUrl, {
      ...fetchOptions,
      // Need to convert Headers to plain object for fetchEventSource
      headers: Object.fromEntries(fetchOptions.headers),
      signal: signal ?? null,
      method: "POST",
      body: JSON.stringify({ message }),
      openWhenHidden: true,

      onmessage(ev) {
        if (process.env.NODE_ENV === "development") {
          console.debug("[EventSource]", ev);
        }
        const parseResult = ConversationStreamEvent.safeParse(JSON.parse(ev.data));
        if (!parseResult.success) {
          throw new Error(`Invalid event received from server: ${ev.data}`);
        }
        const event = parseResult.data;
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
        if (response.ok && response.headers.get("content-type") === "text/event-stream") {
          return; // everything's good
        }

        if (response.status === 400) {
          const data = await response.json();
          throw new Error(data.error ?? `Bad request`);
        }

        if (response.status > 400 && response.status < 500 && response.status !== 429) {
          // client-side errors are usually non-retriable:
          throw new Error(`Chatbot stream error: ${response.statusText}`);
        } else {
          // other errors are possibly retriable
          throw new RetriableError(`Chatbot stream error: ${response.statusText}`, {
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
  };

  const rateMessage: RateMessage = async ({ conversationId, messageId, rating }) => {
    await fetchEndpoint<boolean>(
      `POST /conversations/${conversationId}/messages/${messageId}/rating`,
      {
        body: JSON.stringify({ rating }),
      }
    );
    return rating;
  };

  const commentMessage: CommentMessage = async ({
    conversationId,
    messageId,
    comment,
  }) => {
    return await fetchEndpoint<void>(
      `POST /conversations/${conversationId}/messages/${messageId}/comment`,
      {
        body: JSON.stringify({ comment }),
        validate: createTypeGuard(z.undefined()),
      }
    );
  };

  return {
    createConversation,
    getConversation,
    addMessage,
    addMessageStreaming,
    rateMessage,
    commentMessage,
  };
}
