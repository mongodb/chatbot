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
  // user_ip: string;
  // time_created: Date;
  // last_updated: Date;
};

type ConversationAction =
  | { type: "setConversation"; conversation: Required<ConversationState> }
  | { type: "addMessage"; role: Role; text: string }
  | { type: "modifyMessage"; messageId: MessageData["id"]; text: string }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean };

type ConversationActor = {
  // setConversationId: (conversationId: string) => void;
  createConversation: () => void;
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
  if (action.type !== "setConversation" && !state.conversationId) {
    console.error("Cannot perform action without conversationId");
    return state;
  }
  switch (action.type) {
    case "setConversation": {
      return {
        ...action.conversation,
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
} satisfies ConversationState;

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
    console.log(`setConversation`, conversation);
    dispatch({ type: "setConversation", conversation });
  };

  const createConversation = async () => {
    try {
      if (state.conversationId) {
        console.error(
          `Cannot createConversation when conversationId already exists`
        );
        return state;
      }
      console.log(`Creating conversation`);
      const conversation = await conversationService.createConversation();
      console.log(`Created conversation`, conversation);
      setConversation(conversation);
    } catch (error) {
      console.error(`Failed to create conversation: ${error}`);
    }
  };

  const addMessage = async (role: Role, text: string) => {
    if (!state.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    try {
      dispatch({ type: "addMessage", role, text });
      await conversationService.addMessage({
        conversationId: state.conversationId,
        message: text,
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
    addMessage,
    modifyMessage,
    deleteMessage,
    rateMessage,
  } satisfies Conversation;
}
