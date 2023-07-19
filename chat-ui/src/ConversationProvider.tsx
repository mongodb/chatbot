import { createContext } from "react";
import useConversation, {
  defaultConversationState,
  Conversation,
} from "./useConversation";

export const ConversationContext = createContext<Conversation>({
  ...defaultConversationState,
  createConversation: () => {
    return;
  },
  addMessage: () => {
    return;
  },
  modifyMessage: () => {
    return;
  },
  deleteMessage: () => {
    return;
  },
  rateMessage: () => {
    return;
  },
  endConversationWithError: () => {
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
