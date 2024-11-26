import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { Body, InlineCode } from "@leafygreen-ui/typography";
import { ChatWindow as LGChatWindow } from "@lg-chat/chat-window";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { Suspense, useMemo } from "react";
import { ErrorBanner } from "./Banner";
import {
  CharacterCount,
  InputBar,
  MongoDbInputBarPlaceholder,
} from "./InputBar";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { Conversation } from "./useConversation";
import { type ChatbotViewProps } from "./ChatbotView";
import { useChatbotContext } from "./useChatbotContext";
import { useHotkeyContext } from "./HotkeyContext";
import { ChatMessageFeed } from "./ChatMessageFeed";
import { MessageData } from "./services/conversations";

const styles = {
  chatbot_input: css`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-top: 1rem;
    padding-left: 32px;
    padding-right: 32px;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  `,
  chat_window: css`
    border-radius: 24px;
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
  message_feed: css`
    height: 100%;
    max-height: 70vh;
    & > div {
      box-sizing: border-box;
      max-height: 70vh;
    }
  `,
  message_feed_loader: css`
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
    padding-top: 1.5rem;
  `,
  verify_information: css`
    text-align: center;
  `,
};

export type ChatWindowProps = ChatbotViewProps;

export function ChatWindow(props: ChatWindowProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const {
    className,
    disclaimer,
    disclaimerHeading,
    fatalErrorMessage = defaultChatbotFatalErrorMessage,
    initialMessageText,
    initialMessageReferences,
    initialMessageSuggestedPrompts,
    inputBarId = "chatbot-input-bar",
    inputBottomText,
    windowTitle,
  } = props;

  const {
    awaitingReply,
    chatbotName,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    isExperimental,
    maxInputCharacters,
    setInputText,
  } = useChatbotContext();

  const hasError = inputTextError !== "";

  const hotkeyContext = useHotkeyContext();

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
      references: initialMessageReferences,
    };
    return data;
  }, [
    initialMessageText,
    initialMessageReferences,
    initialMessageSuggestedPrompts,
  ]);

  const inputPlaceholder = conversation.error
    ? fatalErrorMessage
    : props.inputBarPlaceholder ?? MongoDbInputBarPlaceholder();

  return (
    <LeafyGreenChatProvider>
      <LGChatWindow
        className={cx(styles.chat_window, className)}
        badgeText={isExperimental ? "Experimental" : undefined}
        title={windowTitle ?? chatbotName ?? ""}
        darkMode={darkMode}
      >
        <Suspense fallback={null}>
          <ChatMessageFeed
            darkMode={darkMode}
            disclaimer={disclaimer}
            disclaimerHeading={disclaimerHeading}
            initialMessage={initialMessage}
          />
        </Suspense>
        <div className={styles.chatbot_input}>
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
                shouldRenderHotkeyIndicator={hotkeyContext.hotkey !== null}
                onMessageSend={(messageContent) => {
                  const canSubmit =
                    inputTextError.length === 0 && !conversation.error;
                  if (canSubmit) {
                    handleSubmit(messageContent);
                  }
                }}
                textareaProps={{
                  id: inputBarId,
                  value: inputText,
                  onChange: (e) => {
                    setInputText(e.target.value);
                  },
                  placeholder: inputPlaceholder,
                }}
              />

              <div
                className={css`
                    display: flex;
                    justify-content: space-between;
                  `}
              >
                {inputBottomText ? (
                  <Body baseFontSize={13} className={styles.verify_information}>
                    {inputBottomText}
                  </Body>
                ) : null}
                {maxInputCharacters ? (
                  <CharacterCount
                    darkMode={darkMode}
                    current={inputText.length}
                    max={maxInputCharacters}
                  />
                ) : null}
              </div>
            </>
          ) : null}

          <ConversationId conversation={conversation} />
        </div>
      </LGChatWindow>
    </LeafyGreenChatProvider>
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
