import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DisclaimerText } from "@lg-chat/chat-disclaimer";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessageData } from "./services/conversations";
import { useChatbotContext } from "./useChatbotContext";
import { lazy } from "react";
import { DarkModeProps } from "./DarkMode";

const Message = lazy(async () => ({
  default: (await import("./Message")).Message,
}));

const styles = {
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
};

export type ChatMessageFeedProps = DarkModeProps & {
  className?: HTMLElement["className"];
  disclaimer?: React.ReactNode;
  disclaimerHeading?: string;
  initialMessage?: MessageData | null;
  messageBottomContent?: React.ReactNode;
};

export function ChatMessageFeed(props: ChatMessageFeedProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const {
    className,
    disclaimer,
    disclaimerHeading,
    initialMessage,
    messageBottomContent,
  } = props;

  const {
    awaitingReply,
    canSubmit,
    conversation,
    handleSubmit,
    onReferenceClick,
    onSuggestedPromptClick,
  } = useChatbotContext();

  const messages = initialMessage
    ? [initialMessage, ...conversation.messages]
    : conversation.messages;

  return messages.length === 0 ? null : (
    <MessageFeed
      darkMode={darkMode}
      className={cx(styles.message_feed, className)}
    >
      {disclaimer ? (
        <DisclaimerText
          title={disclaimerHeading ?? "Terms of Use"}
          className={styles.disclaimer_text}
        >
          {disclaimer}
        </DisclaimerText>
      ) : null}
      {messages.map((message, idx) => {
        const isLoading =
          message.id === conversation.streamingMessageId &&
          conversation.getMessage(conversation.streamingMessageId ?? "")
            ?.content === "";

        const isInitialMessage = idx === 0;

        const showRatingAndBottomContent =
          !isLoading &&
          // If we've sent a request but the response hasn't started streaming yet, don't show the rating
          !(awaitingReply && conversation.streamingMessageId === message.id) &&
          // Users can rate assistant messages that have started streaming
          message.role === "assistant" &&
          // We don't want users to rate the initial message (and they can't because it's not in the database)
          !isInitialMessage;

        return (
          <Message
            key={message.id}
            messageData={message}
            isLoading={isLoading}
            showRating={showRatingAndBottomContent}
            bottomContent={
              showRatingAndBottomContent ? messageBottomContent : null
            }
            conversation={conversation}
            suggestedPrompts={message.suggestedPrompts}
            showSuggestedPrompts={
              // For now we'll only show suggested prompts for the initial message and hide them once the user submits anything
              isInitialMessage && conversation.messages.length === 0
            }
            onReferenceClick={onReferenceClick}
            onSuggestedPromptClick={(prompt) => {
              onSuggestedPromptClick?.(prompt);
              handleSubmit(prompt);
            }}
            canSubmitSuggestedPrompt={canSubmit}
          />
        );
      })}
    </MessageFeed>
  );
}
