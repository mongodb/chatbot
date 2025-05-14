import { MessageData } from "./services/conversations";
import { Conversation } from "./useConversation";
export type MessageProps = {
    messageData: MessageData;
    suggestedPrompts?: string[];
    showSuggestedPrompts?: boolean;
    onSuggestedPromptClick?: (prompt: string) => void;
    canSubmitSuggestedPrompt?: (prompt: string) => boolean;
    isLoading: boolean;
    showRating: boolean;
    conversation: Conversation;
};
export declare const Message: ({ messageData, suggestedPrompts, showSuggestedPrompts, canSubmitSuggestedPrompt, onSuggestedPromptClick, isLoading, showRating, conversation, }: MessageProps) => import("react/jsx-runtime").JSX.Element;
