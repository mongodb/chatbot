import { useMemo, useReducer } from "react";
import { References } from "chat-core";
import {
  MessageData,
  Role,
  ConversationService,
  formatReferences,
} from "./services/conversations";
import createMessage, { createMessageId } from "./createMessage";
import {
  countRegexMatches,
  removeArrayElementAt,
  updateArrayElementAt,
} from "./utils";

// If SSE is supported, use it to stream responses from the server as
// they're created instead of awaiting the entire response
export const canUseServerSentEvents = () => typeof EventSource !== "undefined";
const STREAMING_MESSAGE_ID = "streaming-response";

export type ConversationState = {
  conversationId?: string;
  messages: MessageData[];
  error?: string;
  isStreamingMessage: boolean;
  streamingMessage?: MessageData;
};

type ConversationAction =
  | { type: "setConversation"; conversation: Required<ConversationState> }
  | { type: "setConversationError"; errorMessage: string }
  | { type: "addMessage"; role: Role; content: string }
  | { type: "modifyMessage"; messageId: MessageData["id"]; content: string }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean }
  | { type: "createStreamingResponse"; data: string }
  | { type: "appendStreamingResponse"; data: string }
  | { type: "finishStreamingResponse"; messageId: MessageData["id"] }
  | { type: "cancelStreamingResponse" };

type ConversationActor = {
  createConversation: () => void;
  endConversationWithError: (errorMessage: string) => void;
  addMessage: (role: Role, content: string) => void;
  modifyMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  rateMessage: (messageId: string, rating: boolean) => void;
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
  function getMessageIndex(messageId: MessageData["id"]) {
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
      const newMessage = createMessage(action.role, action.content);
      return {
        ...state,
        messages: [...state.messages, newMessage],
      };
    }
    case "modifyMessage": {
      if (!state.conversationId) {
        console.error(`Cannot modifyMessage without a conversationId`);
        return state;
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) {
        console.error(
          `Cannot modifyMessage because message with id ${action.messageId} does not exist`
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
        ...createMessage("assistant", action.data),
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
};

export function useConversation(params: UseConversationParams = {}) {
  const conversationService = useMemo(() => {
    return new ConversationService({
      serverUrl: params.serverBaseUrl ?? import.meta.env.VITE_SERVER_BASE_URL,
    });
  }, [params.serverBaseUrl]);

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

  const setConversation = (conversation: Required<ConversationState>) => {
    dispatch({ type: "setConversation", conversation });
  };

  const endConversationWithError = (errorMessage: string) => {
    dispatch({ type: "setConversationError", errorMessage });
  };

  const createConversation = async () => {
    try {
      if (state.conversationId) {
        console.error(
          `Cannot createConversation when conversationId already exists`
        );
        return;
      }
      const conversation = await conversationService.createConversation();
      setConversation({
        ...conversation,
        error: "",
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

  const addMessage = async (role: Role, content: string) => {
    if (!state.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }

    const shouldStream = canUseServerSentEvents() && params.shouldStream;

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
      dispatch({ type: "addMessage", role, content });
      if (shouldStream) {
        dispatch({ type: "createStreamingResponse", data: "" });
        await conversationService.addMessageStreaming({
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
        const response = await conversationService.addMessage({
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

  const modifyMessage = async (messageId: string, content: string) => {
    if (!state.conversationId) {
      console.error(`Cannot modifyMessage without a conversationId`);
      return;
    }
    dispatch({ type: "modifyMessage", messageId, content });
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
    await conversationService.rateMessage({
      conversationId: state.conversationId,
      messageId,
      rating,
    });
    dispatch({ type: "rateMessage", messageId, rating });
  };

  const streamingMessage = state.messages.find(
    (m) => m.id === STREAMING_MESSAGE_ID
  );

  return {
    ...state,
    createConversation,
    endConversationWithError,
    streamingMessage,
    addMessage,
    modifyMessage,
    deleteMessage,
    rateMessage,
  } satisfies Conversation;
}
