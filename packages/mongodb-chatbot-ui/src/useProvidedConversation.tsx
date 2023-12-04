import { useContext } from "react";
import { ConversationContext } from "./ConversationProvider";

export default function useConversation() {
  const conversation = useContext(ConversationContext);
  return conversation;
}
