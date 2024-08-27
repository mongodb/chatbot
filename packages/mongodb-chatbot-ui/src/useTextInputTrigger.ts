import { useState } from "react";
import { MongoDbInputBarPlaceholder } from "./InputBar";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { useChatbotContext } from "./useChatbotContext";
import { ChatbotTriggerProps } from "./ChatbotTrigger";

export type UseTextInputTriggerArgs = {
  placeholder?: string;
  fatalErrorMessage?: string;
};

/**
  The base props for a Chatbot trigger component that allows the user to input text.
 */
export type ChatbotTextInputTriggerProps = ChatbotTriggerProps &
  UseTextInputTriggerArgs;

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
export function useTextInputTrigger({
  placeholder = MongoDbInputBarPlaceholder(),
  fatalErrorMessage = defaultChatbotFatalErrorMessage,
}: UseTextInputTriggerArgs) {
  const {
    openChat,
    awaitingReply,
    handleSubmit,
    conversation,
    isExperimental,
  } = useChatbotContext();

  const [focused, setFocused] = useState(false);
  const [inputText, setInputText] = useState("");
  const [inputTextError, setInputTextError] = useState("");

  const inputPlaceholder = conversation.error ? fatalErrorMessage : placeholder;
  const canSubmit = inputTextError.length === 0 && !conversation.error;
  const hasError = inputTextError !== "";
  const showError = inputTextError !== "" && !open;

  return {
    conversation,
    isExperimental,
    inputText,
    setInputText,
    inputTextError,
    inputPlaceholder,
    setInputTextError,
    canSubmit,
    awaitingReply,
    openChat,
    focused,
    setFocused,
    handleSubmit,
    hasError,
    showError,
  };
}
