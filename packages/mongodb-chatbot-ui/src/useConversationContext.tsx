import { useContext } from "react";
import { ConversationContext } from "./ConversationProvider";

export default function useConversationContext() {
  const conversation = useContext(ConversationContext);
  if (!conversation) {
    throw new Error(
      "useConversationContext must be used within a ChatbotProvider"
    );
  }
  return conversation;
}
