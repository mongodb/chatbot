import { type VerifiedAnswer } from "../verifiedAnswer";
import { type References } from "../references";
export type Role = "user" | "assistant";
export type MessageData = {
    id: string;
    role: Role;
    content: string;
    createdAt: string;
    rating?: boolean;
    references?: References;
    suggestedPrompts?: string[];
    metadata?: AssistantMessageMetadata;
};
export type AssistantMessageMetadata = {
    [k: string]: unknown;
    /**
      The conversation ID that this message is part of. If you add a message
      without specifying a conversation ID, which creates a new conversation, this
      field contains the ID of the new conversation.
    */
    conversationId?: string;
    /**
      If the message came from the verified answers collection, contains the
      metadata about the verified answer.
    */
    verifiedAnswer?: {
        _id: VerifiedAnswer["_id"];
        created: string;
        updated: string | undefined;
    };
};
export type ConversationData = {
    _id: string;
    messages: MessageData[];
    createdAt: number;
};
export declare const CUSTOM_REQUEST_ORIGIN_HEADER = "X-Request-Origin";
export declare function getCustomRequestOrigin(): string | undefined;
export declare class RetriableError<Data extends object = object> extends Error {
    retryAfter: number;
    data?: Data;
    constructor(message: string, config?: {
        retryAfter?: number;
        data?: Data;
    });
}
export declare class TimeoutError<Data extends object = object> extends Error {
    data?: Data;
    constructor(message: string);
}
export type UnknownStreamEvent = {
    type: string;
    data: unknown;
};
export type DeltaStreamEvent = {
    type: "delta";
    data: string;
};
export type ReferencesStreamEvent = {
    type: "references";
    data: References;
};
export type MetadataStreamEvent = {
    type: "metadata";
    data: AssistantMessageMetadata;
};
export type FinishedStreamEvent = {
    type: "finished";
    data: string;
};
export type ConversationStreamEvent = DeltaStreamEvent | ReferencesStreamEvent | MetadataStreamEvent | FinishedStreamEvent;
/**
  Options to include with every fetch request made by the ConversationService.
  This can be used to set headers, etc.
 */
export type ConversationFetchOptions = Omit<RequestInit, "body" | "method" | "signal">;
export type AddMessageRequestBody = {
    message: string;
    clientContext?: Record<string, unknown>;
};
export type ConversationServiceConfig = {
    serverUrl: string;
    fetchOptions?: ConversationFetchOptions | (() => ConversationFetchOptions);
};
export declare class ConversationService {
    private serverUrl;
    private getFetchOptions;
    constructor(config: ConversationServiceConfig);
    private mergeHeaders;
    private getUrl;
    createConversation(): Promise<ConversationData>;
    getConversation(conversationId: string): Promise<ConversationData>;
    addMessage({ conversationId, message, clientContext, }: {
        conversationId: string;
    } & AddMessageRequestBody): Promise<MessageData>;
    addMessageStreaming({ conversationId, message, clientContext, maxRetries, onResponseDelta, onReferences, onMetadata, onResponseFinished, signal, }: {
        conversationId: string;
        maxRetries?: number;
        onResponseDelta: (delta: string) => void;
        onReferences: (references: References) => void;
        onMetadata: (metadata: AssistantMessageMetadata) => void;
        onResponseFinished: (messageId: string) => void;
        signal?: AbortSignal;
    } & AddMessageRequestBody): Promise<void>;
    rateMessage({ conversationId, messageId, rating, }: {
        conversationId: string;
        messageId: string;
        rating: boolean;
    }): Promise<boolean>;
    commentMessage({ conversationId, messageId, comment, }: {
        conversationId: string;
        messageId: string;
        comment: string;
    }): Promise<void>;
}
