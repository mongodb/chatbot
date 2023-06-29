import { createContext } from "react";
import useConversation, {
  defaultConversationState,
  Conversation,
} from "./useConversation";

export const ConversationContext = createContext<Conversation>({
  ...defaultConversationState,
  createConversation: () => {},
  addMessage: () => {},
  modifyMessage: () => {},
  deleteMessage: () => {},
  rateMessage: () => {},
  endConversationWithError: () => {},
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
