import { useReducer } from "react";
import {
  References,
  MessageData,
  Role,
  conversationService,
  formatReferences,
} from "./services/conversations";
import createMessage, { createMessageId } from "./createMessage";
import { updateArrayElementAt } from "./utils";

const SHOULD_STREAM = true;
// const SHOULD_STREAM = false;
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
  | { type: "finishStreamingResponse"; messageId: MessageData["id"] };

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
        console.error(`Cannot appendStreamingResponse without a conversationId`);
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
    default: {
      console.error("Unhandled action", action);
      throw new Error(`Unhandled action type`);
    }
  }
}

export default function useConversation() {
  const [state, _dispatch] = useReducer(
    conversationReducer,
    defaultConversationState
  );
  const dispatch = (...args: Parameters<typeof _dispatch>) => {
    console.log(`dispatch`, ...args);
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

    // Stream control
    const abortController = new AbortController();
    let finishedStreaming = false;
    let streamedMessageId: string | null = null;
    let streamedMessage = "";
    let references: References | null = null;
    const streamingIntervalMs = 50;
    const streamingInterval = setInterval(() => {
      if (streamedMessage) {
        dispatch({ type: "appendStreamingResponse", data: streamedMessage });
        streamedMessage = "";
      }
      if (references) {
        dispatch({
          type: "appendStreamingResponse",
          data: formatReferences(references),
        });
        references = null;
      }
      if (finishedStreaming) {
        if (!streamedMessageId) {
          streamedMessageId = createMessageId();
        }
        dispatch({
          type: "finishStreamingResponse",
          messageId: streamedMessageId,
        });
      }
    }, streamingIntervalMs);

    try {
      dispatch({ type: "addMessage", role, content });
      if (SHOULD_STREAM) {
        dispatch({ type: "createStreamingResponse", data: "" });
        await conversationService.addMessageStreaming({
          conversationId: state.conversationId,
          message: content,
          maxRetries: 0,
          onResponseDelta: async (data: string) => {
            streamedMessage += data;
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
        const response = await conversationService.addMessage({
          conversationId: state.conversationId,
          message: content,
        });
        references = response.sse ?? null;
        const referencesContent = references
          ? formatReferences(references)
          : "";
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
      endConversationWithError(errorMessage);
    } finally {
      setTimeout(() => {
        clearInterval(streamingInterval);
      }, streamingIntervalMs);
    }
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
