export declare const ConversationStateContext: import("react").Context<import("zustand").StoreApi<Omit<import("./conversationStore").ConversationState, "name" | "api"> & {
    name: string;
    api: {
        initialize: (initialState: import("./conversationStore").ConversationState) => void;
        setConversationId: (conversationId: string) => void;
        setConversationError: (errorMessage: string) => void;
        addMessage: (messageData: import(".").MessageData | import("./createMessage").CreateMessageArgs) => void;
        setMessageContent: (messageId: string, content: string) => void;
        updateMessageMetadata: (messageId: string, update: (metadata: import(".").AssistantMessageMetadata) => import(".").AssistantMessageMetadata) => void;
        deleteMessage: (messageId: string) => void;
        rateMessage: (messageId: string, rating: boolean) => void;
        createStreamingResponse: () => void;
        appendStreamingResponse: (newContent: string) => void;
        appendStreamingReferences: (references: import("./references").References) => void;
        finishStreamingResponse: (messageId: import(".").MessageData["id"]) => void;
        cancelStreamingResponse: () => void;
    };
}>>;
export declare function ConversationStateProvider(props: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
