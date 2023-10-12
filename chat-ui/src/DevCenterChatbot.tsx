import { css } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { useMemo } from "react";
import { ChatbotModal } from "./ChatbotModal";
import { MessageData } from "./services/conversations";
import { SUGGESTED_PROMPTS, WELCOME_MESSAGE } from "./constants";
import { InnerChatbotProps } from "./Chatbot";

const styles = {
  chat_trigger: css`
    position: fixed;
    bottom: 24px;
    right: 24px;

    @media screen and (min-width: 768px) {
      bottom: 32px;
      right: 24px;
    }
    @media screen and (min-width: 1024px) {
      bottom: 32px;
      right: 49px;
    }
  `,
};

export function DevCenterChatbot(props: InnerChatbotProps) {
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

  const initialMessage = useMemo(() => {
    const data: MessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: initialMessageText,
      createdAt: new Date().toLocaleTimeString(),
      suggestedPrompts,
    };
    return data;
  }, [initialMessageText, suggestedPrompts]);

  return (
    <>
      <ChatTrigger
        className={styles.chat_trigger}
        onClick={async () => {
          await openChat();
        }}
      >
        MongoDB AI
      </ChatTrigger>
      <ChatbotModal
        awaitingReply={awaitingReply}
        conversation={conversation}
        darkMode={darkMode}
        handleSubmit={handleSubmit}
        initialMessage={initialMessage}
        inputBarRef={inputBarRef}
        inputText={inputText}
        inputTextError={inputTextError}
        open={open}
        setInputText={setInputText}
        shouldClose={closeChat}
        showDisclaimer
      />
    </>
  );
}
