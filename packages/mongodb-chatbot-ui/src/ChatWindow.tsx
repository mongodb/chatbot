import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { Body, InlineCode } from "@leafygreen-ui/typography";
import { DisclaimerText } from "@lg-chat/chat-disclaimer";
import { ChatWindow as LGChatWindow } from "@lg-chat/chat-window";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { MessageFeed } from "@lg-chat/message-feed";
import { useMemo } from "react";
import { ErrorBanner } from "./Banner";
import {
  CharacterCount,
  InputBar,
  MongoDbInputBarPlaceholder,
} from "./InputBar";
import { Message } from "./Message";
import { MessageData } from "./services/conversations";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { Conversation } from "./useConversation";
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
  chat_window: css`
    border-radius: 24px;
  `,
  message_feed: css`
    height: 100%;
    max-height: 70vh;
    & > div {
      box-sizing: border-box;
      max-height: 70vh;
    }
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
    canSubmit,
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

  const messages = initialMessage
    ? [initialMessage, ...conversation.messages]
    : conversation.messages;

  const isEmptyConversation = messages.length === 0;

  const hasError = inputTextError !== "";

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
        {!isEmptyConversation ? (
          <MessageFeed darkMode={darkMode} className={styles.message_feed}>
            {disclaimer ? (
              <DisclaimerText
                title={disclaimerHeading ?? "Terms of Use"}
                className={styles.disclaimer_text}
              >
                {disclaimer}
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
                    !(
                      awaitingReply &&
                      conversation.streamingMessage?.id === message.id
                    ) &&
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
                  canSubmitSuggestedPrompt={canSubmit}
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
