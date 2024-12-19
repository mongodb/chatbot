import { useContext } from "react";
import { ConversationStateContext } from "./ConversationStateProvider";
import { useStore } from "zustand/react";

export function useConversationStateContext() {
  const store = useContext(ConversationStateContext);
  const state = useStore(store);
  return state;
}
