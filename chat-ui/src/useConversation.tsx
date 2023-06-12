import { useReducer } from "react";
import { MessageData, Role } from "./Message";
import createMessage from "./createMessage";

type ConversationState = {
  messages: MessageData[];
  // user_ip: string;
  // time_created: Date;
  // last_updated: Date;
};

type ConversationAction =
  | { type: "addMessage"; role: Role; text: string }
  | { type: "modifyMessage"; messageId: MessageData["id"]; text: string }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean };

type ConversationActor = {
  addMessage: (role: Role, text: string) => void;
  modifyMessage: (messageId: string, text: string) => void;
  deleteMessage: (messageId: string) => void;
  rateMessage: (messageId: string, rating: boolean) => void;
};

export type ConversationPayload = ConversationState & ConversationActor;

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
    case "addMessage": {
      return {
        ...state,
        messages: [
          ...state.messages,
          createMessage(action.role, action.text),
        ],
      };
    }
    case "modifyMessage": {
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) return state;
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          { ...state.messages[messageIndex], text: action.text },
          ...state.messages.slice(messageIndex + 1),
        ],
      };
    }
    case "deleteMessage": {
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
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) return state;
      return {
        ...state,
        messages: [
          ...state.messages.slice(0, messageIndex),
          {
            ...state.messages[messageIndex],
            rating: action.rating,
          },
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
  messages: [
    {
      id: "1",
      content: "What is the best flavor of ice cream dog?",
      role: "user",
    },
    {
      id: "2",
      content: `As an AI, I don't have personal preferences, but I can tell you that the "best" flavor of ice cream is subjective and varies depending on individual tastes. Some popular flavors include vanilla, chocolate, strawberry, mint chocolate chip, cookies and cream, and many more. Ultimately, the best flavor of ice cream is the one that you enjoy the most!`,
      role: "assistant",
    },
    {
      id: "3",
      content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
      role: "user",
    },
  ],
} satisfies ConversationState;

export default function useConversation() {
  const [state, dispatch] = useReducer(
    conversationReducer,
    defaultConversationState
  );

  const addMessage = (role: Role, text: string) => {
    dispatch({ type: "addMessage", role, text });
  };

  const modifyMessage = (messageId: string, text: string) => {
    dispatch({ type: "modifyMessage", messageId, text });
  };

  const deleteMessage = (messageId: string) => {
    dispatch({ type: "deleteMessage", messageId });
  };

  const rateMessage = (messageId: string, rating: boolean) => {
    dispatch({ type: "rateMessage", messageId, rating });
  };

  return {
    ...state,
    addMessage,
    modifyMessage,
    deleteMessage,
    rateMessage,
  } satisfies ConversationPayload;
}
