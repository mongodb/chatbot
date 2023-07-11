import { useReducer } from "react";
import {
  MessageData,
  Role,
  conversationService,
} from "./services/conversations";
import createMessage, { createMessageId } from "./createMessage";

const SHOULD_STREAM = true;
// const SHOULD_STREAM = false;
const StreamingMessageId = "streaming-response";

export type ConversationState = {
  conversationId?: string;
  messages: MessageData[];
  error?: string;
  isStreamingMessage: boolean;
  // user_ip: string;
  // time_created: Date;
  // last_updated: Date;
};

type ConversationAction =
  | { type: "setConversation"; conversation: Required<ConversationState> }
  | { type: "setConversationError"; errorMessage: string }
  | { type: "addMessage"; role: Role; content: string }
  | { type: "modifyMessage"; messageId: MessageData["id"]; content: string }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean }
  | { type: "addToStreamingResponse"; data: string }
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
    if (messageIndex === -1) {
      console.error(`Message(${messageId}) not found in state`);
    }
    return messageIndex;
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
      if (messageIndex === -1) return state;
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
      if (messageIndex === -1) return state;
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
      if (messageIndex === -1) return state;
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
    case "addToStreamingResponse": {
      if (!state.conversationId) {
        console.error(`Cannot addToStreamingResponse without a conversationId`);
        return state;
      }

      const messageIndex = state.messages.findIndex(
        (msg) => msg.id === StreamingMessageId
      );
      if (messageIndex === -1) {
        return {
          ...state,
          isStreamingMessage: true,
          messages: [
            ...state.messages,
            {
              ...createMessage("assistant", action.data),
              id: StreamingMessageId,
            },
          ],
        };
      }

      const message = state.messages[messageIndex];
      const updatedMessage = {
        ...message,
        content: message.content + action.data,
      };
      return {
        ...state,
        isStreamingMessage: true,
        messages: [
          ...state.messages.slice(0, messageIndex),
          updatedMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "finishStreamingResponse": {
      const messageIndex = state.messages.findIndex(
        (msg) => msg.id === StreamingMessageId
      );
      if (messageIndex === -1) {
        console.error(
          `Cannot finishStreamingResponse without a streamingMessage`
        );
        return state;
      }
      const streamedMessage = state.messages[messageIndex];
      const finalMessage = {
        ...streamedMessage,
        id: action.messageId,
      };

      return {
        ...state,
        isStreamingMessage: false,
        messages: [
          ...state.messages.slice(0, messageIndex),
          finalMessage,
          ...state.messages.slice(messageIndex + 1),
        ],
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
    const streamingIntervalMs = 50;
    const streamingInterval = setInterval(() => {
      if (streamedMessage) {
        dispatch({ type: "addToStreamingResponse", data: streamedMessage });
        streamedMessage = "";
      }
      if (finishedStreaming) {
        if(!streamedMessageId) {
          streamedMessageId = createMessageId()
        }
        dispatch({ type: "finishStreamingResponse", messageId: streamedMessageId });
      }
    }, streamingIntervalMs);

    try {
      dispatch({ type: "addMessage", role, content });
      if (SHOULD_STREAM) {
        await conversationService.addMessageStreaming({
          conversationId: state.conversationId,
          message: content,
          maxRetries: 0,
          onResponseDelta: async (data: string) => {
            streamedMessage += data;
          },
          onResponseFinished: async (message: MessageData) => {
            streamedMessageId = message.id;
            finishedStreaming = true;
          },
          signal: abortController.signal,
        });
      } else {
        const response = await conversationService.addMessage({
          conversationId: state.conversationId,
          message: content,
        });
        dispatch({
          type: "addMessage",
          role: "assistant",
          content: response.content,
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

  return {
    ...state,
    createConversation,
    endConversationWithError,
    addMessage,
    modifyMessage,
    deleteMessage,
    rateMessage,
  } satisfies Conversation;
}
