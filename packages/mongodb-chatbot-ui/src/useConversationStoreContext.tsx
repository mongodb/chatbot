import { useContext } from "react";
import { ConversationStoreContext } from "./ConversationStoreProvider";

export function useConversationStoreContext() {
  const store = useContext(ConversationStoreContext);
  return store;
}
