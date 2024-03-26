import { createContext } from "react";
import {
  useConversation,
  defaultConversationState,
  Conversation,
} from "./useConversation";

export const ConversationContext = createContext<Conversation>({
  ...defaultConversationState,
  createConversation: async () => {
    return;
  },
  endConversationWithError: () => {
    return;
  },
  addMessage: async () => {
    return;
  },
  setMessageContent: async () => {
    return;
  },
  setMessageMetadata: async () => {
    return;
  },
  deleteMessage: async () => {
    return;
  },
  rateMessage: async () => {
    return;
  },
  commentMessage: async () => {
    return;
  },
  switchConversation: async () => {
    return;
  },
});

export default function ConversationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const providerValue = useConversation();

  return (
    <ConversationContext.Provider value={providerValue}>
      {children}
    </ConversationContext.Provider>
  );
}
