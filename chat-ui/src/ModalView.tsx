import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import Modal, { ModalProps } from "@leafygreen-ui/modal";
import { palette } from "@leafygreen-ui/palette";
import { Body, InlineCode } from "@leafygreen-ui/typography";
import { DisclaimerText } from "@lg-chat/chat-disclaimer";
import { ChatWindow } from "@lg-chat/chat-window";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { MessageFeed } from "@lg-chat/message-feed";
import { useMemo } from "react";
import { ErrorBanner } from "./Banner";
import { CharacterCount, InputBar } from "./InputBar";
import { LegalDisclosure } from "./LegalDisclosure";
import { Message } from "./Message";
import { MAX_INPUT_CHARACTERS } from "./constants";
import { MessageData } from "./services/conversations";
import { Conversation } from "./useConversation";
import { type StylesProps } from "./utils";
import { type ChatbotViewProps } from "./ChatbotView";
import { useChatbotContext } from "./useChatbotContext";

const styles = {
  chatbot_input: css`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
  `,
  chatbot_input_area: css`
    padding-left: 32px;
    padding-right: 32px;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  `,
  conversation_id: css`
    display: flex;
    flex-direction: row;
    justify-content: center;
  `,
  disclaimer_text: css`
    text-align: center;
    margin-top: 16px;
    margin-bottom: 32px;
  `,
  modal_container: ({ darkMode }: StylesProps) => css`
    z-index: 100;

    & * {
      box-sizing: border-box;
    }

    & div[role="dialog"] {
      padding: 0;
      background: ${darkMode ? palette.black : palette.gray.light3};

      > button {
        top: 14px;
      }
    }

    @media screen and (max-width: 1024px) {
      & div[role="dialog"] {
        width: 100%;
      }

      & > div {
        padding: 32px 18px;
      }
    }
  `,
  chat_window: css`
    border-radius: 24px;
  `,
  message_feed: css`
    & > div {
      box-sizing: border-box;
    }
  `,
  verify_information: css`
    text-align: center;
  `,
};

export type ModalViewProps = ChatbotViewProps & {
  shouldClose?: ModalProps["shouldClose"];
};

export function ModalView(props: ModalViewProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const {
    initialMessageText,
    initialMessageSuggestedPrompts,
    showDisclaimer,
  } = props;
  const {
    awaitingReply,
    closeChat,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    open,
    setInputText,
  } = useChatbotContext();

  const initialMessage: MessageData | null = useMemo(() => {
    if (!initialMessageText) {
      return null;
    }
    const data: MessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: initialMessageText,
      createdAt: new Date().toLocaleTimeString(),
      suggestedPrompts: initialMessageSuggestedPrompts,
    };
    return data;
  }, [initialMessageText, initialMessageSuggestedPrompts]);

  const messages = initialMessage
    ? [initialMessage, ...conversation.messages]
    : conversation.messages;

  const isEmptyConversation = messages.length === 0;

  const ActiveInputBarId = "active-input-bar";

  const hasError = inputTextError !== "";

  const shouldClose = () => {
    if(props.shouldClose?.() ?? true) {
      closeChat();
      return true;
    } else {
      return false;
    }
  }

  return (
    <Modal
      className={styles.modal_container({ darkMode })}
      open={open}
      size="large"
      initialFocus={`#${ActiveInputBarId}`}
      shouldClose={shouldClose}
    >
      <LeafyGreenChatProvider>
        <ChatWindow
          className={styles.chat_window}
          badgeText="Experimental"
          title="MongoDB AI"
          darkMode={darkMode}
        >
          {!isEmptyConversation ? (
            <MessageFeed darkMode={darkMode} className={styles.message_feed}>
              {showDisclaimer ? (
                <DisclaimerText
                  title="Terms and Policy"
                  className={styles.disclaimer_text}
                >
                  <LegalDisclosure />
                </DisclaimerText>
              ) : null}
              {messages.map((message, idx) => {
                const isLoading = conversation.isStreamingMessage
                  ? message.id === conversation.streamingMessage?.id &&
                    conversation.streamingMessage?.content === ""
                  : false;

                const isInitialMessage = idx === 0;

                return (
                  <Message
                    key={message.id}
                    messageData={message}
                    isLoading={isLoading}
                    showRating={
                      // Users can rate assistant messages that have started streaming
                      message.role === "assistant" &&
                      !isLoading &&
                      // We don't want users to rate the initial message (and they can't because it's not in the database)
                      !isInitialMessage
                    }
                    conversation={conversation}
                    suggestedPrompts={message.suggestedPrompts}
                    showSuggestedPrompts={
                      // For now we'll only show suggested prompts for the initial message and hide them once the user submits anything
                      isInitialMessage && conversation.messages.length === 0
                    }
                    onSuggestedPromptClick={handleSubmit}
                  />
                );
              })}
            </MessageFeed>
          ) : null}
          <div className={cx(styles.chatbot_input, styles.chatbot_input_area)}>
            {conversation.error ? (
              <ErrorBanner darkMode={darkMode} message={conversation.error} />
            ) : null}

            {!conversation.error ? (
              <>
                <InputBar
                  hasError={hasError}
                  shouldRenderGradient={!inputTextError}
                  darkMode={darkMode}
                  ref={inputBarRef}
                  disabled={Boolean(conversation.error?.length)}
                  disableSend={hasError || awaitingReply}
                  onMessageSend={(messageContent) => {
                    const canSubmit =
                      inputTextError.length === 0 && !conversation.error;
                    if (canSubmit) {
                      handleSubmit(messageContent);
                    }
                  }}
                  textareaProps={{
                    id: ActiveInputBarId,
                    value: inputText,
                    onChange: (e) => {
                      setInputText(e.target.value);
                    },
                    placeholder: conversation.error
                      ? "Something went wrong. Try reloading the page and starting a new conversation."
                      : awaitingReply
                      ? "MongoDB AI is answering..."
                      : "Ask MongoDB AI a Question",
                  }}
                />

                <div
                  className={css`
                    display: flex;
                    justify-content: space-between;
                  `}
                >
                  <Body baseFontSize={13} className={styles.verify_information}>
                    This is an experimental generative AI chatbot. All
                    information should be verified prior to use.
                  </Body>
                  <CharacterCount
                    darkMode={darkMode}
                    current={inputText.length}
                    max={MAX_INPUT_CHARACTERS}
                  />
                </div>
              </>
            ) : null}

            <ConversationId conversation={conversation} />
          </div>
        </ChatWindow>
      </LeafyGreenChatProvider>
    </Modal>
  );
}

function ConversationId({ conversation }: { conversation: Conversation }) {
  return import.meta.env.VITE_QA === "true" ? (
    <div className={styles.conversation_id}>
      <Body>
        Conversation ID: <InlineCode>{conversation.conversationId}</InlineCode>
      </Body>
    </div>
  ) : null;
}
