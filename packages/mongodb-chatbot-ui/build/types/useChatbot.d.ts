import React from "react";
import { useConversation, type UseConversationParams } from "./useConversation";
export type OpenCloseHandlers = {
    onOpen?: () => void;
    onClose?: () => void;
};
export type UseChatbotProps = OpenCloseHandlers & UseConversationParams & {
    chatbotName?: string;
    isExperimental?: boolean;
    maxInputCharacters?: number;
    maxCommentCharacters?: number;
};
export type ChatbotData = {
    awaitingReply: boolean;
    canSubmit: (text: string) => boolean;
    closeChat: () => boolean;
    conversation: ReturnType<typeof useConversation>;
    handleSubmit: (text: string) => void | Promise<void>;
    inputBarRef: React.RefObject<HTMLFormElement>;
    inputText: string;
    inputTextError: string;
    chatbotName?: string;
    isExperimental: boolean;
    maxInputCharacters?: number;
    maxCommentCharacters?: number;
    open: boolean;
    openChat: () => void;
    setInputText: (text: string) => void;
};
export declare function useChatbot({ onOpen, onClose, chatbotName, isExperimental, maxInputCharacters, maxCommentCharacters, ...useConversationArgs }: UseChatbotProps): ChatbotData;
