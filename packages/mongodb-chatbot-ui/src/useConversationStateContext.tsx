import { useContext } from "react";
import { ConversationStateContext } from "./ConversationStateProvider";

export function useConversationStateContext() {
  const store = useContext(ConversationStateContext);

  return store;
}
