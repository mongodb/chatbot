import { ChatbotTriggerProps } from "./ChatbotTrigger";
export type UseTextInputTriggerArgs = {
    placeholder?: string;
    fatalErrorMessage?: string;
};
/**
  The base props for a Chatbot trigger component that allows the user to input text.
 */
export type ChatbotTextInputTriggerProps = ChatbotTriggerProps & UseTextInputTriggerArgs;
/**
 * A hook that provides the necessary props to create a Chatbot trigger component that allows the user to input text.
 * @param args - The arguments to configure the trigger.
 * @returns The props to create a Chatbot trigger component that allows the user to input text.
 * @example
 * ```tsx
 * const textInputTrigger = useTextInputTrigger({
 *   placeholder: "Type something...",
 *   fatalErrorMessage: "An error occurred. Please try again.",
 * });
 * return <MyInputBar
 *   value={textInputTrigger.inputText}
 *   placeholder={textInputTrigger.inputPlaceholder}
 *   error={textInputTrigger.inputTextError || undefined}
 *   onTextChange={newText => textInputTrigger.setInputText(newText)}
 *   onSubmit={() => {
 *     textInputTrigger.handleSubmit(textInputTrigger.inputText);
 *   }}
 * />;
 * ```
 */
export declare function useTextInputTrigger({ placeholder, fatalErrorMessage, }: UseTextInputTriggerArgs): {
    conversation: import("./useConversation").Conversation;
    isExperimental: boolean;
    inputText: string;
    setInputText: import("react").Dispatch<import("react").SetStateAction<string>>;
    inputTextError: string;
    inputPlaceholder: string;
    setInputTextError: import("react").Dispatch<import("react").SetStateAction<string>>;
    canSubmit: boolean;
    awaitingReply: boolean;
    openChat: () => void;
    focused: boolean;
    setFocused: import("react").Dispatch<import("react").SetStateAction<boolean>>;
    handleSubmit: (text: string) => void | Promise<void>;
    hasError: boolean;
    showError: false;
};
