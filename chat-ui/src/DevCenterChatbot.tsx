import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { FloatingActionButtonTrigger } from "./FloatingActionButtonTrigger";
import { useMemo } from "react";
import { ChatbotModal } from "./ChatbotModal";
import { SUGGESTED_PROMPTS, WELCOME_MESSAGE } from "./constants";
import { MessageData } from "./services/conversations";
import { usePolymorphicChatbotData } from "./usePolymorphicChatbot";

export function DevCenterChatbot() {
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
    initialMessageText = WELCOME_MESSAGE,
    handleSubmit,
    open,
    suggestedPrompts = SUGGESTED_PROMPTS,
  } = props;

  // TODO - can we only provide the // ! props and get the rest from context?

  return (
    <>
      <FloatingActionButtonTrigger openChat={openChat} closeChat={closeChat} />
      <ChatbotModal
        awaitingReply={awaitingReply}
        conversation={conversation}
        darkMode={darkMode}
        handleSubmit={handleSubmit}
        initialMessageText={initialMessageText} // !
        initialMessageSuggestedPrompts={suggestedPrompts} // !
        inputBarRef={inputBarRef}
        inputText={inputText}
        inputTextError={inputTextError}
        open={open}
        setInputText={setInputText}
        shouldClose={closeChat}
        showDisclaimer // !
      />
    </>
  );
}
