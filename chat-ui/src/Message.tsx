import { css } from "@emotion/css";
import { Body, Link } from "@leafygreen-ui/typography";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import { Avatar, Variant as AvatarVariant } from "@lg-chat/avatar";
import {
  Message as LGMessage,
  MessageSourceType,
  MessageContainer,
} from "@lg-chat/message";
import {
  MessagePrompts as LGMessagePrompts,
  MessagePrompt,
} from "@lg-chat/message-prompts";
import { MessageRatingProps } from "@lg-chat/message-rating";
import { Fragment, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useUser, User } from "./useUser";
import { MessageData } from "./services/conversations";
import { Conversation } from "./useConversation";

const TRANSITION_DURATION = 300;

const styles = {
  message_prompts: css`
    margin-left: 70px;
    @media screen and (max-width: 804px) {
      margin-left: 50px;
    }

    transition: opacity ${TRANSITION_DURATION}ms ease-in;

    &-enter {
      opacity: 0;
    }
    &-enter-active {
      opacity: 1;
    }
    &-exit {
      opacity: 1;
    }
    &-exit-active {
      opacity: 0;
    }
  `,
  message_rating: css`
    margin-top: 1rem;
  `,
  // This is a hacky fix for weird white-space issues in LG Chat.
  markdown_container: css`
    display: flex;
    flex-direction: column;

    & * {
      line-height: 28px;
    }

    & li {
      white-space: normal;
      margin-top: -1.5rem;

      & li {
        margin-top: 0;
      }
    }
  `,
  // End hacky fix
  markdown_ul: css`
    overflow-wrap: anywhere;
  `,
  loading_skeleton: css`
    margin-bottom: 16px;
    width: 100%;

    & > div {
      width: 100%;
    }
  `,
  message_container: css`
    min-width: 320px;
  `,
};

const LoadingSkeleton = () => {
  return <ParagraphSkeleton className={styles.loading_skeleton} />;
};

export type MessageProp = {
  messageData: MessageData;
  suggestedPrompts?: string[];
  showSuggestedPrompts?: boolean;
  onSuggestedPromptClick?: (prompt: string) => void;
  isLoading: boolean;
  showRating: boolean;
  conversation: Conversation;
};

function getMessageInfo(message: MessageData, user?: User) {
  return {
    isSender: message.role === "user",
    senderName: message.role === "user" ? user?.name : "Mongo",
    avatarVariant:
      message.role === "user" ? AvatarVariant.User : AvatarVariant.Mongo,
  };
}

export const Message = ({
  messageData,
  suggestedPrompts = [],
  showSuggestedPrompts = true,
  onSuggestedPromptClick,
  isLoading,
  showRating,
  conversation,
}: MessageProp) => {
  const user = useUser();
  const info = getMessageInfo(messageData, user);

  return (
    <Fragment key={messageData.id}>
      <LGMessage
        baseFontSize={13}
        isSender={info.isSender}
        messageRatingProps={
          showRating
            ? {
                className: styles.message_rating,
                description: "How was the response?",
                onChange: (e) => {
                  const value = e.target.value as MessageRatingProps["value"];
                  if (!value) {
                    return;
                  }
                  conversation.rateMessage(
                    messageData.id,
                    value === "liked" ? true : false
                  );
                },
                value:
                  messageData.rating === undefined
                    ? undefined
                    : messageData.rating
                    ? "liked"
                    : "disliked",
              }
            : undefined
        }
        avatar={<Avatar variant={info.avatarVariant} name={info.senderName} />}
        sourceType={isLoading ? undefined : MessageSourceType.Markdown}
        componentOverrides={{
          MessageContainer: (props) => (
            <MessageContainer className={styles.message_container} {...props} />
          ),
        }}
        markdownProps={{
          className: styles.markdown_container,
          components: {
            a: ({ children, href }) => {
              return (
                <Link hideExternalIcon href={href}>
                  {children}
                </Link>
              );
            },
            p: ({ children, ...props }) => {
              return <Body {...props}>{children}</Body>;
            },
            ol: ({ children, ordered, ...props }) => {
              return (
                <Body as="ol" {...props}>
                  {children}
                </Body>
              );
            },
            ul: ({ children, ordered, ...props }) => {
              return (
                <Body className={styles.markdown_ul} as="ul" {...props}>
                  {children}
                </Body>
              );
            },
            li: ({ children, ordered, node, ...props }) => {
              return (
                <Body as="li" {...props}>
                  {children}
                </Body>
              );
            },
          },
        }}
      >
        {isLoading
          ? ((<LoadingSkeleton />) as unknown as string)
          : messageData.content}
      </LGMessage>
      {showSuggestedPrompts && (
        <MessagePrompts
          messagePrompts={suggestedPrompts}
          messagePromptsOnClick={(prompt) => onSuggestedPromptClick?.(prompt)}
        />
      )}
    </Fragment>
  );
};

export type MessagePromptsProps = {
  messagePrompts: string[];
  messagePromptsOnClick: (prompt: string) => void;
};

export const MessagePrompts = ({
  messagePrompts,
  messagePromptsOnClick,
}: MessagePromptsProps) => {
  const [inProp, setInProp] = useState(true);
  const [suggestedPromptIdx, setSuggestedPromptIdx] = useState(-1);
  const nodeRef = useRef(null);
  const duration = 300;

  return (
    <CSSTransition
      in={inProp}
      timeout={duration}
      nodeRef={nodeRef}
      classNames={styles.message_prompts}
    >
      <div className={styles.message_prompts} ref={nodeRef}>
        <LGMessagePrompts label="Suggested Prompts">
          {messagePrompts.map((sp, idx) => (
            <MessagePrompt
              key={sp}
              onClick={() => {
                setSuggestedPromptIdx(idx);
                setInProp(false);
                setTimeout(() => {
                  messagePromptsOnClick(messagePrompts[idx]);
                }, duration);
              }}
              selected={idx === suggestedPromptIdx}
            >
              {sp}
            </MessagePrompt>
          ))}
        </LGMessagePrompts>
      </div>
    </CSSTransition>
  );
};
