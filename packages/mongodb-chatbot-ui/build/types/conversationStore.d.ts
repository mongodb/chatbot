import { AssistantMessageMetadata, MessageData } from "./services/conversations";
import { CreateMessageArgs } from "./createMessage";
import { References } from "./references";
export type ConversationState = {
    conversationId?: string;
    error?: string;
    messages: MessageData[];
    streamingMessageId?: MessageData["id"];
};
export declare const initialConversationState: ConversationState;
export declare const STREAMING_MESSAGE_ID = "streaming-response";
export type ConversationStore = ReturnType<typeof makeConversationStore>;
export declare const makeConversationStore: (name?: string) => import("zustand").StoreApi<Omit<ConversationState, "name" | "api"> & {
    name: string;
    api: {
        initialize: (initialState: ConversationState) => void;
        setConversationId: (conversationId: string) => void;
        setConversationError: (errorMessage: string) => void;
        addMessage: (messageData: MessageData | CreateMessageArgs) => void;
        setMessageContent: (messageId: string, content: string) => void;
        updateMessageMetadata: (messageId: string, update: (metadata: AssistantMessageMetadata) => AssistantMessageMetadata) => void;
        deleteMessage: (messageId: string) => void;
        rateMessage: (messageId: string, rating: boolean) => void;
        createStreamingResponse: () => void;
        appendStreamingResponse: (newContent: string) => void;
        appendStreamingReferences: (references: References) => void;
        finishStreamingResponse: (messageId: MessageData["id"]) => void;
        cancelStreamingResponse: () => void;
    };
}>;
