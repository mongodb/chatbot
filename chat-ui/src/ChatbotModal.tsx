import { css, cx } from "@emotion/css";
import Modal, { ModalProps } from "@leafygreen-ui/modal";
import { palette } from "@leafygreen-ui/palette";
import { Body, InlineCode, Link } from "@leafygreen-ui/typography";
import { ChatWindow } from "@lg-chat/chat-window";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { MessageFeed } from "@lg-chat/message-feed";
import { InputBar, CharacterCount } from "./InputBar";
import { Message } from "./Message";
import { Conversation } from "./useConversation";
import { type StylesProps } from "./utils";
import { MAX_INPUT_CHARACTERS } from "./constants";
import { ErrorBanner } from "./Banner";
import { MessageData } from "./services/conversations";
import { DisclaimerText } from "@lg-chat/chat-disclaimer";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";

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

export type ChatbotModalProps = {
  awaitingReply: boolean;
  conversation: Conversation;
  darkMode?: boolean;
  handleSubmit: (text: string) => Promise<void>;
  inputBarRef: React.RefObject<HTMLFormElement>;
  inputText: string;
  inputTextError: string;
  open: boolean;
  setInputText: (text: string) => void;
  shouldClose: ModalProps["shouldClose"];
  showDisclaimer?: boolean;
  suggestedPrompts?: string[];
  initialMessage?: MessageData;
};

export function ChatbotModal({
  awaitingReply,
  conversation,
  darkMode: propsDarkMode,
  handleSubmit,
  initialMessage,
  inputBarRef,
  inputText,
  inputTextError,
  open,
  setInputText,
  shouldClose,
  showDisclaimer = false,
}: ChatbotModalProps) {
  const { darkMode } = useDarkMode(propsDarkMode);
  const isEmptyConversation = conversation.messages.length === 0;

  const messages = initialMessage
    ? [initialMessage, ...conversation.messages]
    : conversation.messages;

  const ActiveInputBarId = "active-input-bar";

  // TODO
  // const promptIsTooLong = inputText.length > MAX_INPUT_CHARACTERS;

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
              {showDisclaimer ? <ChatDisclaimer /> : null}
              {messages.map((message) => {
                const isLoading = conversation.isStreamingMessage
                  ? message.id === conversation.streamingMessage?.id &&
                    conversation.streamingMessage?.content === ""
                  : false;
                return (
                  <Message
                    key={message.id}
                    messageData={message}
                    showSuggestedPrompts={false}
                    isLoading={isLoading}
                    showRating={message.role === "assistant" && !isLoading}
                    conversation={conversation}
                    // TODO
                    // suggestedPrompts={suggestedPrompts}
                    // showSuggestedPrompts={
                    //   idx === 0 && conversation.messages.length === 0
                    // }
                    // onSuggestedPromptClick={handleSubmit}
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
                  // TODO
                  // inputBarHasError={promptIsTooLong()}
                  // disableSend={awaitingReply || promptIsTooLong()}
                  hasError={inputTextError !== ""}
                  shouldRenderGradient={!inputTextError}
                  darkMode={darkMode}
                  ref={inputBarRef}
                  disabled={Boolean(conversation.error?.length)}
                  disableSend={awaitingReply}
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

function ChatDisclaimer() {
  // TODO - Get Link tck
  return (
    <DisclaimerText
      title="Terms and Policy"
      className={styles.disclaimer_text}
    >
      <Body>
        This is a generative AI Chatbot. By interacting with it, you agree to
        MongoDB's{" "}
        <Link
          hideExternalIcon
          href={"https://www.mongodb.com/legal/terms-of-use"}
        >
          Terms of Use
        </Link>{" "}
        and{" "}
        <Link
          hideExternalIcon
          href={"https://www.mongodb.com/legal/acceptable-use-policy"}
        >
          Acceptable Use Policy.
        </Link>
      </Body>
    </DisclaimerText>
  );
};
