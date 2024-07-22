import { useState } from "react";
import { MongoDbInputBarPlaceholder } from "./InputBar";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { useChatbotContext } from "./useChatbotContext";

export type UseTextInputTriggerArgs = {
  placeholder?: string;
  fatalErrorMessage?: string;
};

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
