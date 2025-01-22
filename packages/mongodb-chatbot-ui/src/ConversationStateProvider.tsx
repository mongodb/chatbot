import { createContext, useState } from "react";
import {
  ConversationStore,
  initialConversationState,
  makeConversationStore,
} from "./conversationStore";

const ConversationStoreNotInitialized =
  "A conversation store was used before it was initialized.";

const defaultState = {
  ...initialConversationState,
  api: new Proxy(
    {} as ReturnType<ConversationStore["getInitialState"]>["api"],
    {
      get: () => () => {
        throw new Error(ConversationStoreNotInitialized);
      },
    }
  ),
} as ReturnType<ConversationStore["getInitialState"]>;

const defaultStore = {
  getInitialState: () => defaultState,
  getState: () => defaultState,
  setState: () => {
    throw new Error(ConversationStoreNotInitialized);
  },
  subscribe: () => () => {
    throw new Error(ConversationStoreNotInitialized);
  },
} satisfies ConversationStore;

export const ConversationStateContext =
  createContext<ConversationStore>(defaultStore);

export function ConversationStateProvider(props: {
  children: React.ReactNode;
}) {
  // The useState initializer function ensures that the store is only created once per mount of this provider.
  // See https://tkdodo.eu/blog/use-state-for-one-time-initializations for more information.
  const [store] = useState(() => makeConversationStore("state"));
  return (
    <ConversationStateContext.Provider value={store}>
      {props.children}
    </ConversationStateContext.Provider>
  );
}
