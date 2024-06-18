import { useMemo, useReducer } from "react";
import { type References } from "mongodb-rag-core";
import {
  Message,
  CreateUserMessageInit,
  CreateAssistantMessageInit,
  makeConversationsClient,
  ConversationActionFetchOptions,
  AssistantMessageMetadata,
  createMessage,
  createMessageId,
} from "mongodb-chatbot-api/client";
import {
  countRegexMatches,
  removeArrayElementAt,
  updateArrayElementAt,
  canUseServerSentEvents,
} from "./utils";

const STREAMING_MESSAGE_ID = "streaming-response";

export type ConversationState = {
  conversationId?: string;
  messages: Message[];
  error?: string;
  isStreamingMessage: boolean;
  streamingMessage?: Message;
};

type ConversationAction =
  | { type: "setConversation"; conversation: ConversationState }
  | { type: "setConversationError"; errorMessage: string }
  | ({ type: "addMessage" } & CreateUserMessageInit)
  | ({ type: "addMessage" } & CreateAssistantMessageInit)
  | { type: "setMessageContent"; messageId: Message["id"]; content: string }
  | {
      type: "setMessageMetadata";
      messageId: Message["id"];
      metadata: AssistantMessageMetadata;
    }
  | { type: "deleteMessage"; messageId: Message["id"] }
  | { type: "rateMessage"; messageId: Message["id"]; rating: boolean }
  | { type: "createStreamingResponse"; data: string }
  | { type: "appendStreamingResponse"; data: string }
  | { type: "finishStreamingResponse"; messageId: Message["id"] }
  | { type: "cancelStreamingResponse" };

/**
 * Converts a ConversationAction type to a an object that contains the
 * action event without its `type` field. This can be used an argument
 * to the corresponding "actor" function.
 */
type ConversationActorArgs<K extends ConversationAction["type"]> = Omit<
  Extract<ConversationAction, { type: K }>,
  "type"
>;

type ConversationActor = {
  createConversation: () => Promise<void>;
  endConversationWithError: (errorMessage: string) => void;
  addUserMessage: (args: Omit<CreateUserMessageInit, "role">) => Promise<void>;
  setMessageContent: (messageId: string, content: string) => Promise<void>;
  setMessageMetadata: (
    args: ConversationActorArgs<"setMessageMetadata">
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  rateMessage: (messageId: string, rating: boolean) => Promise<void>;
  commentMessage: (messageId: string, comment: string) => Promise<void>;
  switchConversation: (conversationId: string) => Promise<void>;
};

export type Conversation = ConversationState & ConversationActor;

export const defaultConversationState = {
  messages: [],
  error: "",
  isStreamingMessage: false,
} satisfies ConversationState;

function conversationReducer(
  state: ConversationState,
  action: ConversationAction
): ConversationState {
  function getMessageIndex(messageId: Message["id"]) {
    const messageIndex = state.messages.findIndex(
      (message) => message.id === messageId
    );
    return messageIndex;
  }
  function getStreamingMessage() {
    const streamingMessageIndex = getMessageIndex(STREAMING_MESSAGE_ID);
    const streamingMessage =
      streamingMessageIndex === -1
        ? null
        : state.messages[streamingMessageIndex];
    return {
      streamingMessageIndex,
      streamingMessage,
    };
  }
  switch (action.type) {
    case "setConversation": {
      return {
        ...action.conversation,
        error: "",
      };
    }
    case "setConversationError": {
      return {
        ...state,
        error: action.errorMessage,
      };
    }
    case "addMessage": {
      if (!state.conversationId) {
        console.error(`Cannot addMessage without a conversationId`);
      }
      const { type, ...createMessageArgs } = action;
      const newMessage = createMessage(createMessageArgs);
      return {
        ...state,
        messages: [...state.messages, newMessage],
      };
    }
    case "setMessageContent": {
      if (!state.conversationId) {
        console.error(`Cannot setMessageContent without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot setMessageContent because message with id ${action.messageId} does not exist`
        );
        return state;
      }
      const modifiedMessage = {
        ...state.messages[messageIndex],
        content: action.content,
      };
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          modifiedMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "setMessageMetadata": {
      if (!state.conversationId) {
        console.error(`Cannot setMessageMetadata without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot setMessageMetadata because message with id ${action.messageId} does not exist`
        );
        return state;
      }
      const existingMessage = state.messages[messageIndex];
      if (existingMessage.role !== "assistant") {
        console.error(
          `Cannot setMessageMetadata because message with id ${action.messageId} is not an assistant message`
        );
        return state;
      }
      const modifiedMessage = {
        ...existingMessage,
        metadata: action.metadata,
      };
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          modifiedMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "deleteMessage": {
      if (!state.conversationId) {
        console.error(`Cannot deleteMessage without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot deleteMessage because message with id ${action.messageId} does not exist`
        );
        return state;
      }
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "rateMessage": {
      if (!state.conversationId) {
        console.error(`Cannot rateMessage without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot rateMessage because message with id ${action.messageId} does not exist`
        );
        return state;
      }

      const ratedMessage = {
        ...state.messages[messageIndex],
        rating: action.rating,
      };
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          ratedMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "createStreamingResponse": {
      if (!state.conversationId) {
        console.error(
          `Cannot createStreamingResponse without a conversationId`
        );
        return state;
      }
      let { streamingMessage } = getStreamingMessage();
      if (streamingMessage) {
        console.error(
          `Cannot createStreamingResponse because a streamingMessage already exists`
        );
        return state;
      }
      streamingMessage = {
        ...createMessage({
          role: "assistant",
          content: action.data,
        }),
        id: STREAMING_MESSAGE_ID,
      };
      return {
        ...state,
        isStreamingMessage: true,
        streamingMessage,
        messages: [...state.messages, streamingMessage],
      };
    }
    case "appendStreamingResponse": {
      if (!state.conversationId) {
        console.error(
          `Cannot appendStreamingResponse without a conversationId`
        );
        return state;
      }
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage();
      if (!streamingMessage) {
        console.error(
          `Cannot appendStreamingResponse without a streamingMessage. Make sure to dispatch createStreamingResponse first.`
        );
        return state;
      }
      const modifiedMessage = {
        ...streamingMessage,
        content: streamingMessage.content + action.data,
      };
      return {
        ...state,
        messages: updateArrayElementAt(
          state.messages,
          streamingMessageIndex,
          modifiedMessage
        ),
      };
    }
    case "finishStreamingResponse": {
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage();
      if (!streamingMessage) {
        console.error(
          `Cannot finishStreamingResponse without a streamingMessage`
        );
        return state;
      }
      const finalMessage = {
        ...streamingMessage,
        id: action.messageId,
      };

      return {
        ...state,
        isStreamingMessage: false,
        streamingMessage: undefined,
        messages: updateArrayElementAt(
          state.messages,
          streamingMessageIndex,
          finalMessage
        ),
      };
    }
    case "cancelStreamingResponse": {
      const { streamingMessage, streamingMessageIndex } = getStreamingMessage();
      if (!streamingMessage) {
        console.error(
          `Cannot cancelStreamingResponse without a streamingMessage`
        );
        return state;
      }

      const messages = removeArrayElementAt(
        state.messages,
        streamingMessageIndex
      );

      return {
        ...state,
        isStreamingMessage: false,
        streamingMessage: undefined,
        messages,
      };
    }
    default: {
      console.error("Unhandled action", action);
      throw new Error(`Unhandled action type`);
    }
  }
}

type UseConversationParams = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  fetchOptions?: ConversationActionFetchOptions;
};

export function useConversation(params: UseConversationParams = {}) {
  const conversationsService = useMemo(() => {
    return makeConversationsClient({
      serverUrl: params.serverBaseUrl ?? import.meta.env.VITE_SERVER_BASE_URL,
      fetchOptions: params.fetchOptions,
    });
  }, [params.serverBaseUrl, params.fetchOptions]);

  const [state, _dispatch] = useReducer(
    conversationReducer,
    defaultConversationState
  );
  const dispatch = (...args: Parameters<typeof _dispatch>) => {
    if (import.meta.env.MODE !== "production") {
      console.log(`dispatch`, ...args);
    }
    _dispatch(...args);
  };

  const setConversation = (conversation: ConversationState) => {
    dispatch({ type: "setConversation", conversation });
  };

  const endConversationWithError = (errorMessage: string) => {
    dispatch({ type: "setConversationError", errorMessage });
  };

  const createConversation = async () => {
    try {
      const conversation = await conversationsService.createConversation();
      setConversation({
        ...conversation,
        conversationId: conversation._id,
        isStreamingMessage: false,
      });
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to create conversation.";
      console.error(errorMessage);
      endConversationWithError(errorMessage);
    }
  };

  const addUserMessage: ConversationActor["addUserMessage"] = async ({
    content,
  }) => {
    const role = "user";
    if (!state.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }

    const shouldStream =
      canUseServerSentEvents() && (params.shouldStream ?? true);

    // Stream control
    const abortController = new AbortController();
    let finishedStreaming = false;
    let finishedBuffering = !shouldStream;
    let streamedMessageId: string | null = null;
    let references: References | null = null;
    let bufferedTokens: string[] = [];
    let streamedTokens: string[] = [];
    const streamingIntervalMs = 50;
    const streamingInterval = setInterval(() => {
      const [nextToken, ...remainingTokens] = bufferedTokens;

      bufferedTokens = remainingTokens;

      if (nextToken) {
        dispatch({ type: "appendStreamingResponse", data: nextToken });
      }

      const allBufferedTokensDispatched =
        finishedStreaming && bufferedTokens.length === 0;

      if (references && allBufferedTokensDispatched) {
        // Count the number of markdown code fences in the response. If
        // it's odd, the streaming message stopped in the middle of a
        // code block and we need to escape from it.
        const numCodeFences = countRegexMatches(
          /```/g,
          streamedTokens.join("")
        );
        if (numCodeFences % 2 !== 0) {
          dispatch({
            type: "appendStreamingResponse",
            data: "\n```\n\n",
          });
        }

        dispatch({
          type: "appendStreamingResponse",
          data: formatReferences(references),
        });
        references = null;
      }
      if (!finishedBuffering && allBufferedTokensDispatched) {
        if (!streamedMessageId) {
          streamedMessageId = createMessageId();
        }
        dispatch({
          type: "finishStreamingResponse",
          messageId: streamedMessageId,
        });
        finishedBuffering = true;
      }
    }, streamingIntervalMs);

    try {
      dispatch({
        type: "addMessage",
        role,
        content,
      });
      if (shouldStream) {
        dispatch({ type: "createStreamingResponse", data: "" });
        await conversationsService.addMessageStreaming({
          conversationId: state.conversationId,
          message: content,
          maxRetries: 0,
          onResponseDelta: async (data: string) => {
            bufferedTokens = [...bufferedTokens, data];
            streamedTokens = [...streamedTokens, data];
          },
          onReferences: async (data: References) => {
            references = data;
          },
          onMetadata: async (metadata) => {
            setMessageMetadata({
              messageId: STREAMING_MESSAGE_ID,
              metadata,
            });
          },
          onResponseFinished: async (messageId: string) => {
            streamedMessageId = messageId;
            finishedStreaming = true;
          },
          signal: abortController.signal,
        });
      } else {
        // We start a streaming response to indicate the loading state
        // but we'll never append to it since the response message comes
        // in all at once.
        dispatch({ type: "createStreamingResponse", data: "" });
        const response = await conversationsService.addMessage({
          conversationId: state.conversationId,
          message: content,
        });
        references = response.references ?? null;
        const referencesContent = references
          ? formatReferences(references)
          : "";
        dispatch({ type: "cancelStreamingResponse" });
        dispatch({
          type: "addMessage",
          role: "assistant",
          content: response.content + referencesContent,
          metadata: response.metadata,
        });
      }
    } catch (error) {
      abortController.abort();
      console.error(`Failed to add message: ${error}`);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      dispatch({ type: "cancelStreamingResponse" });
      clearInterval(streamingInterval);

      endConversationWithError(errorMessage);
      throw error;
    }

    let cleanupInterval: ReturnType<typeof setInterval> | undefined;
    return new Promise<void>((resolve) => {
      cleanupInterval = setInterval(() => {
        if (finishedBuffering) {
          clearInterval(streamingInterval);
          clearInterval(cleanupInterval);
          resolve();
        }
      }, streamingIntervalMs);
    });
  };

  const setMessageContent = async (messageId: string, content: string) => {
    if (!state.conversationId) {
      console.error(`Cannot setMessageContent without a conversationId`);
      return;
    }
    dispatch({ type: "setMessageContent", messageId, content });
  };

  const setMessageMetadata: ConversationActor["setMessageMetadata"] = async ({
    messageId,
    metadata,
  }) => {
    if (!state.conversationId) {
      console.error(`Cannot setMessageMetadata without a conversationId`);
      return;
    }
    dispatch({ type: "setMessageMetadata", messageId, metadata });
  };

  const deleteMessage = async (messageId: string) => {
    if (!state.conversationId) {
      console.error(`Cannot deleteMessage without a conversationId`);
      return;
    }
    dispatch({ type: "deleteMessage", messageId });
  };

  const rateMessage = async (messageId: string, rating: boolean) => {
    if (!state.conversationId) {
      console.error(`Cannot rateMessage without a conversationId`);
      return;
    }
    await conversationsService.rateMessage({
      conversationId: state.conversationId,
      messageId,
      rating,
    });
    dispatch({ type: "rateMessage", messageId, rating });
  };

  const commentMessage = async (messageId: string, comment: string) => {
    if (!state.conversationId) {
      console.error(`Cannot commentMessage without a conversationId`);
      return;
    }
    await conversationsService.commentMessage({
      conversationId: state.conversationId,
      messageId,
      comment,
    });
  };

  const streamingMessage = state.messages.find(
    (m) => m.id === STREAMING_MESSAGE_ID
  );

  /**
   * Switch to a different, existing conversation.
   */
  const switchConversation = async (conversationId: string) => {
    try {
      const conversation = await conversationsService.getConversation({
        conversationId,
      });
      setConversation({
        ...conversation,
        conversationId,
        isStreamingMessage: false,
      });
    } catch (error) {
      const errorMessage =
        typeof error === "string"
          ? error
          : error instanceof Error
          ? error.message
          : "Failed to switch conversation.";
      console.error(errorMessage);
      // Rethrow the error so that we can handle it in the UI
      throw error;
    }
  };

  return {
    ...state,
    createConversation,
    endConversationWithError,
    streamingMessage,
    addUserMessage,
    setMessageContent,
    setMessageMetadata,
    deleteMessage,
    rateMessage,
    commentMessage,
    switchConversation,
  } satisfies Conversation;
}

export function formatReferences(references: References): string {
  if (references.length === 0) {
    return "";
  }
  const heading = "\n\n**Related resources:**";
  const listOfLinks = references.map(
    (entry) => `- [${entry.title}](${entry.url})`
  );
  return [heading, ...listOfLinks].join("\n\n");
}
