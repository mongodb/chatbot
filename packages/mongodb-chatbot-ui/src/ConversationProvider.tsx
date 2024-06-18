import { createContext } from "react";
import { defaultConversationState, Conversation } from "./useConversation";

export const ConversationContext = createContext<Conversation>({
  ...defaultConversationState,
  createConversation: async () => {
    return;
  },
  endConversationWithError: () => {
    return;
  },
  addUserMessage: async () => {
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
  conversation,
}: {
  children: React.ReactNode;
  conversation: Conversation;
}) {
  return (
    <ConversationContext.Provider value={conversation}>
      {children}
    </ConversationContext.Provider>
  );
}
