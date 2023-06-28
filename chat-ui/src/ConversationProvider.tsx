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
  // TODO: implement
  endConversationWithError: function (errorMessage: string): void {
    throw new Error("Function not implemented.");
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
