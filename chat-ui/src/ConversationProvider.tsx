import { createContext } from "react";
import useConversation, {
  defaultConversationState,
  ConversationPayload,
} from "./useConversation";

export const ConversationContext = createContext<ConversationPayload>({
  ...defaultConversationState,
  addMessage: () => {},
  modifyMessage: () => {},
  deleteMessage: () => {},
  rateMessage: () => {},
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
