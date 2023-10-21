import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { useState } from "react";
import { ChatbotModal } from "./ChatbotModal";
import { usePolymorphicChatbotData } from "./usePolymorphicChatbot";
import { InputBarTrigger } from "./InputBarTrigger";

export function DocsChatbot() {
  const props = usePolymorphicChatbotData();
  const { darkMode } = useDarkMode(props.darkMode);

  const {
    conversation,
    openChat,
    closeChat,
    awaitingReply,
    inputBarRef,
    inputText,
    setInputText,
    inputTextError,
    handleSubmit,
    open,
    suggestedPrompts,
  } = props;

  const [focused, setFocused] = useState(false); // TODO: Move this to InputBarTrigger

  const canSubmit = inputTextError.length === 0 && !conversation.error;
  const inputPlaceholder = conversation.error
    ? "Something went wrong. Try reloading the page and starting a new conversation."
    : awaitingReply
    ? "MongoDB AI is answering..."
    : "Ask MongoDB AI a Question";
  const hasError = inputTextError !== "";
  const showError = inputTextError !== "" && !open;
  const showSuggestedPrompts =
    (suggestedPrompts ?? []).length > 0 &&
    inputText.length === 0 &&
    conversation.messages.length === 0 &&
    !awaitingReply;

  return (
    <>
      <InputBarTrigger
        openChat={openChat}
        closeChat={closeChat}
        handleSubmit={handleSubmit}
        conversation={conversation}
        focused={focused} // !~
        setFocused={setFocused} // !~
        canSubmit={canSubmit} // !~
        inputText={inputText}
        setInputText={setInputText}
        inputTextError={inputTextError}
        inputPlaceholder={inputPlaceholder} // !~
        hasError={hasError} // !~
        showError={showError} // !~
        showSuggestedPrompts={showSuggestedPrompts} // !~
        suggestedPrompts={suggestedPrompts}
      />
      <ChatbotModal
        awaitingReply={awaitingReply}
        conversation={conversation}
        darkMode={darkMode}
        handleSubmit={handleSubmit}
        inputBarRef={inputBarRef}
        inputText={inputText}
        inputTextError={inputTextError}
        open={open}
        setInputText={setInputText}
        shouldClose={closeChat}
        showDisclaimer={false}
      />
    </>
  );
}
