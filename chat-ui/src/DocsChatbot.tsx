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

  return (
    <>
      <InputBarTrigger
        openChat={openChat}
        closeChat={closeChat}
        awaitingReply={awaitingReply}
        handleSubmit={handleSubmit}
        conversation={conversation}
        setInputText={setInputText}
        inputText={inputText}
        inputTextError={inputTextError}
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
