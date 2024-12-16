import { createContext, useRef } from "react";
import {
  ConversationStore,
  // initialConversationState,
  makeConversationStore,
} from "./conversationStore";

// const defaultConversationStore = makeConversationStore();

// export const ConversationStoreContext = createContext<ConversationStore | null>(
//   // defaultConversationStore
//   null
// );

// const ConversationStoreNotInitialized =
//   "A conversation store was used before it was initialized.";

// const defaultState = {
//   ...initialConversationState,
//   api: new Proxy({} as ReturnType<ConversationStore["getState"]>["api"], {
//     get: () => () => {
//       throw new Error(ConversationStoreNotInitialized);
//     },
//   }),
// } satisfies ReturnType<ConversationStore["getState"]>;

// const defaultStore = {
//   getInitialState: () => defaultState,
//   getState: () => defaultState,
//   setState: () => {
//     throw new Error(ConversationStoreNotInitialized);
//   },
//   subscribe: () => () => {
//     // throw new Error(ConversationStoreNotInitialized);
//   },
// } satisfies ConversationStore;

const defaultStore = makeConversationStore();

export const ConversationStoreContext =
  createContext<ConversationStore>(defaultStore);

export function ConversationStoreProvider(props: {
  children: React.ReactNode;
}) {
  // const [store] = useState(makeConversationStore);

  // Use useRef instead of useState to ensure the store is only created once
  const storeRef = useRef<ConversationStore>();

  if (!storeRef.current) {
    console.log("Making initial conversation store");
    storeRef.current = makeConversationStore();
    console.log("Made initial conversation store", storeRef.current);
  }

  const store = storeRef.current;

  return (
    <ConversationStoreContext.Provider value={store}>
      {props.children}
    </ConversationStoreContext.Provider>
  );
}
