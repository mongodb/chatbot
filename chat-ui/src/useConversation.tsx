import { useEffect, useLayoutEffect, useReducer } from "react";
import { MessageData, Role, conversationService } from "./services/conversations";
import createMessage from "./createMessage";
// import { conversationService } from "./services/conversations";

export type ConversationState = {
  conversationId?: string;
  messages: MessageData[];
  // user_ip: string;
  // time_created: Date;
  // last_updated: Date;
};

type ConversationAction =
  | { type: "setConversationId"; conversationId: string }
  | { type: "addMessage"; role: Role; text: string }
  | { type: "modifyMessage"; messageId: MessageData["id"]; text: string }
  | { type: "deleteMessage"; messageId: MessageData["id"] }
  | { type: "rateMessage"; messageId: MessageData["id"]; rating: boolean };

type ConversationActor = {
  setConversationId: (conversationId: string) => void;
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
  if (action.type !== "setConversationId" && !state.conversationId) {
    console.error("Cannot perform action without conversationId");
    return state;
  }
  switch (action.type) {
    case "setConversationId": {
      return {
        ...state,
        conversationId: action.conversationId,
      };
    }
    case "addMessage": {
      if (!state.conversationId) {
        console.error(`Cannot addMessage without a conversationId`);
      }
      const newMessage = createMessage(action.role, action.text);
      // conversationService.addMessage({
      //   conversationId: state.conversationId,
      //   message: newMessage,
      // });
      return {
        ...state,
        messages: [...state.messages, newMessage],
      };
    }
    case "modifyMessage": {
      if (!state.conversationId) {
        console.error(`Cannot modifyMessage without a conversationId`);
        return state
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
        return state
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
        return state
      }
      const messageIndex = getMessageIndex(action.messageId);
      if (messageIndex === -1) return state;
      // conversationService.rateMessage({
      //   conversationId: state.conversationId,
      //   messageId: action.messageId,
      //   rating: action.rating,
      // });
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
  conversationId: "123",
  messages: [
    // {
    //   id: "1",
    //   content: "What is the best flavor of ice cream dog?",
    //   role: "user",
    // },
    // {
    //   id: "2",
    //   content: `As an AI, I don't have personal preferences, but I can tell you that the "best" flavor of ice cream is subjective and varies depending on individual tastes. Some popular flavors include vanilla, chocolate, strawberry, mint chocolate chip, cookies and cream, and many more. Ultimately, the best flavor of ice cream is the one that you enjoy the most!`,
    //   role: "assistant",
    // },
    // {
    //   id: "3",
    //   content: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.`,
    //   role: "user",
    // },
    // {
    //   id: "4",
    //   content:
    //     '# H1\n\ntext\n\n## H2\n\ntext\n\n### H3\n\nHere\'s some code that you can use to query MongoDB:\n\n```python\nimport pymongo\n\n# Connect to MongoDB\nclient = pymongo.MongoClient("mongodb://localhost:27017/")\ndb = client["your_database_name"]\ncollection = db["your_collection_name"]\n\n# Define the query\nquery = { "field_name": "desired_value" }\n\n# Execute the query\nresults = collection.find(query)\n\n# Process the results\nfor result in results:\n    print(result)\n\n# Close the MongoDB connection\nclient.close()\n```\n\nI hope this helps!',
    //   role: "user",
    // },
  ],
} satisfies ConversationState;

export default function useConversation() {
  const [state, dispatch] = useReducer(
    conversationReducer,
    defaultConversationState
  );

  const setConversationId = (conversationId: string) => {
    dispatch({ type: "setConversationId", conversationId });
  };

  const addMessage = async (role: Role, text: string) => {
    if (!state.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    try {
      await conversationService.addMessage({
        conversationId: state.conversationId,
        message: text,
      });
      dispatch({ type: "addMessage", role, text });
    } catch (error) {
      console.error(`Failed to add message: ${error}`);
    }
  };

  const modifyMessage = async (messageId: string, text: string) => {
    dispatch({ type: "modifyMessage", messageId, text });
  };

  const deleteMessage = async (messageId: string) => {
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

  useEffect(() => {
    async function createConversationOnLoad() {
      const { conversationId } = await conversationService.createConversation();
      if(!conversationId) throw new Error(`Failed to create conversation`);
      setConversationId(conversationId);
    }
    createConversationOnLoad();
  }, []);

  return {
    ...state,
    setConversationId,
    addMessage,
    modifyMessage,
    deleteMessage,
    rateMessage,
  } satisfies Conversation;
}
