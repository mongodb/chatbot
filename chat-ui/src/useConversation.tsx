import { useReducer } from "react";
import {
  MessageData,
  Role,
  conversationService,
} from "./services/conversations";
import createMessage from "./createMessage";

export type ConversationState = {
  conversationId?: string;
  messages: MessageData[];
  error?: string;
  // user_ip: string;
  // time_created: Date;
  // last_updated: Date;
};

type ConversationAction =
  | { type: "setConversation"; conversation: Required<ConversationState> }
  | { type: "setConversationError"; errorMessage: string }
  | { type: "addMessage"; role: Role; text: string }
  | { type: "modifyMessage"; messageId: MessageData["id"]; text: string }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean };

type ConversationActor = {
  createConversation: () => void;
  endConversationWithError: (errorMessage: string) => void;
  addMessage: (role: Role, text: string) => void;
  modifyMessage: (messageId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;
  rateMessage: (messageId: string, rating: boolean) => void;
};

export type Conversation = ConversationState & ConversationActor;

function conversationReducer(
  state: ConversationState,
  action: ConversationAction
) {
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
      const newMessage = createMessage(action.role, action.text);
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
        text: action.text,
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
    default: {
      console.error("Unhandled action", action);
      throw new Error(`Unhandled action type`);
    }
  }
}

export const defaultConversationState = {
  messages: [],
  error: "",
} satisfies ConversationState;

export default function useConversation() {
  const [state, _dispatch] = useReducer(
    conversationReducer,
    defaultConversationState
  );
  // const dispatch = _dispatch;
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
      console.error(`Failed to create conversation: ${error}`);
      throw error;
    }
  };

  const addMessage = async (role: Role, text: string) => {
    if (!state.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    try {
      dispatch({ type: "addMessage", role, text });
      const response = await conversationService.addMessage({
        conversationId: state.conversationId,
        message: text,
      });
      dispatch({
        type: "addMessage",
        role: "assistant",
        text: response.content,
      });
    } catch (error) {
      console.error(`Failed to add message: ${error}`);
    }
  };

  const modifyMessage = async (messageId: string, text: string) => {
    if (!state.conversationId) {
      console.error(`Cannot modifyMessage without a conversationId`);
      return;
    }
    dispatch({ type: "modifyMessage", messageId, text });
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
