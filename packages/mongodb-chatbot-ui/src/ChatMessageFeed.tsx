import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DisclaimerText } from "@lg-chat/chat-disclaimer";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessageData } from "./services/conversations";
import { useChatbotContext } from "./useChatbotContext";
import { lazy } from "react";
import { DarkModeProps } from "./DarkMode";
import { mapRatingBooleanToValue } from "./MessageRating";
import { AssistantMessageProps } from "./Message";

const MessagePromise = import("./Message");

const Message = lazy(async () => ({
  default: (await MessagePromise).Message,
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
};

export function ChatMessageFeed(props: ChatMessageFeedProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const { className, disclaimer, disclaimerHeading, initialMessage } = props;

  const { awaitingReply, canSubmit, conversation, handleSubmit } =
    useChatbotContext();

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
        switch (message.role) {
          case "user": {
            return (
              <Message
                key={message.id}
                id={message.id}
                role="user"
                content={message.content}
              />
            );
          }
          case "assistant": {
            const isLoading = conversation.isStreamingMessage
              ? message.id === conversation.streamingMessage?.id &&
                conversation.streamingMessage?.content === ""
              : false;

            const isInitialMessage = idx === 0;

            const showRating =
              // Users can rate assistant messages that have started streaming
              message.role === "assistant" &&
              !isLoading &&
              !(
                awaitingReply &&
                conversation.streamingMessage?.id === message.id
              ) &&
              // We don't want users to rate the initial message (and they can't because it's not in the database)
              !isInitialMessage;

            const rating = (
              showRating
                ? {
                    value: mapRatingBooleanToValue(message.rating),
                    // comment: "",
                  }
                : undefined
            ) satisfies AssistantMessageProps["rating"];

            const suggestedPrompts = (
              message.suggestedPrompts !== undefined &&
              message.suggestedPrompts.length > 0
                ? {
                    prompts: message.suggestedPrompts,
                    onClick: handleSubmit,
                    canSubmit,
                  }
                : undefined
            ) satisfies AssistantMessageProps["suggestedPrompts"];

            const verified = (
              message.metadata?.verifiedAnswer
                ? {
                    verifier: "MongoDB Staff",
                    verifiedAt: new Date(
                      message.metadata?.verifiedAnswer.created ??
                        message.metadata?.verifiedAnswer.updated
                    ),
                  }
                : undefined
            ) as AssistantMessageProps["verified"];

            return (
              <Message
                key={message.id}
                id={message.id}
                role="assistant"
                content={message.content}
                isLoading={isLoading}
                rating={rating}
                references={message.references}
                suggestedPrompts={suggestedPrompts}
                verified={verified}
              />
            );
          }
        }
      })}
    </MessageFeed>
  );
}
