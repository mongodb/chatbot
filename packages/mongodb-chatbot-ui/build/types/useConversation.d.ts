import { ConversationFetchOptions, MessageData } from "./services/conversations";
import { SortReferences } from "./references";
import { type ConversationState } from "./conversationStore";
export type ConversationMethods = {
    createConversation: () => Promise<void>;
    switchConversation: (conversationId: string) => Promise<void>;
    submit: (content: string) => Promise<void>;
    getMessage: (messageId: string) => MessageData | undefined;
    rateMessage: (messageId: string, rating: boolean) => Promise<void>;
    commentMessage: (messageId: string, comment: string) => Promise<void>;
};
export type Conversation = ConversationState & ConversationMethods;
export type UseConversationParams = {
    serverBaseUrl: string;
    shouldStream?: boolean;
    sortMessageReferences?: SortReferences;
    /**
     * Optional fetch options for the ConversationService. Can be either a static
     * `ConversationFetchOptions` object for all request or a function that
     * dynamically returns a new `ConversationFetchOptions` object for each request.
     */
    fetchOptions?: ConversationFetchOptions | (() => ConversationFetchOptions);
    getClientContext?: () => Record<string, unknown>;
};
export declare function useConversation(params: UseConversationParams): Conversation;
