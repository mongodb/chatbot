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
import { MessageRating, MessageRatingProps } from "@lg-chat/message-rating";
import { Fragment, useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";
import { useUser, User } from "./useUser";
import { MessageData } from "./services/conversations";
import { Conversation } from "./useConversation";
import { InlineMessageFeedback } from "@lg-chat/message-feedback";
// @ts-expect-error Typescript imports of icons currently not supported
import WarningIcon from "@leafygreen-ui/icon/dist/Warning";
import { spacing } from "@leafygreen-ui/tokens";
import { palette } from "@leafygreen-ui/palette";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";

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
    margin-top: 0.5rem;

    // Ensure that the rating icons are properly center aligned. The
    // docs site has a global label style that adds a margin here
    // without this style.
    & label {
      margin: 0;
    }
  `,
  // This is a hacky fix for weird white-space issues in LG Chat.
  markdown_container: css`
    display: flex;
    flex-direction: column;

    & * {
      line-height: 28px;
    }

    & p {
      font-weight: 400;
    }

    & a {
      font-weight: 400;
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
  markdown_list: css`
    overflow-wrap: anywhere;
    margin-bottom: -1.5rem;

    & ul {
      margin-bottom: 0;
    }

    & ol {
      margin-bottom: 0;
    }
  `,
  loading_skeleton: css`
    width: 100%;

    & > div {
      width: 100%;
    }
  `,
  message_container: css`
    min-width: 320px;
  `,
  message_rating_comment: css`
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

type RatingCommentStatus = "none" | "submitted" | "abandoned";

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

  const [ratingCommentStatus, setRatingCommentStatus] =
    useState<RatingCommentStatus>("none");

  const [ratingCommentErrorMessage, setRatingCommentErrorMessage] = useState<
    string | undefined
  >();

  async function submitRatingComment(commentText: string) {
    if (!commentText) {
      return;
    }
    try {
      await conversation.commentMessage(messageData.id, commentText);
      setRatingCommentStatus("submitted");
    } catch (err) {
      setRatingCommentErrorMessage(
        "Oops, there was an issue submitting the response to the server. Please try again."
      );
    }
  }
  function abandonRatingComment() {
    setRatingCommentStatus("abandoned");
  }

  return (
    <Fragment key={messageData.id}>
      <LGMessage
        baseFontSize={16}
        isSender={info.isSender}
        messageRatingProps={{
          className: styles.message_rating,
          description: "How was the response?",
          onChange: async (e) => {
            const value = e.target.value as MessageRatingProps["value"];
            if (!value) {
              return;
            }
            if (ratingCommentStatus === "submitted") {
              // Once a user has submitted a comment for their rating we don't want them to be able to change their rating
              return;
            }
            await conversation.rateMessage(
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
        }}
        avatar={<Avatar variant={info.avatarVariant} name={info.senderName} />}
        sourceType={isLoading ? undefined : MessageSourceType.Markdown}
        componentOverrides={{
          MessageContainer: (props) => (
            <MessageContainer className={styles.message_container} {...props} />
          ),
          MessageRating: (props) => {
            console.log("MessageRating::props", props);
            return (
              <>
                {showRating ? (
                  <MessageRatingWithFeedbackComment
                    {...props}
                    submit={submitRatingComment}
                    abandon={abandonRatingComment}
                    status={ratingCommentStatus}
                    errorMessage={ratingCommentErrorMessage}
                  />
                ) : null}
              </>
            );
          },
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
                <Body as="ol" className={styles.markdown_list} {...props}>
                  {children}
                </Body>
              );
            },
            ul: ({ children, ordered, ...props }) => {
              return (
                <Body className={styles.markdown_list} as="ul" {...props}>
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

export type MessageRatingWithFeedbackCommentProps = MessageRatingProps & {
  submit: (commentText: string) => void;
  abandon: () => void;
  status: "none" | "submitted" | "abandoned";
  errorMessage?: string;
};

export function MessageRatingWithFeedbackComment(
  props: MessageRatingWithFeedbackCommentProps
) {
  const {
    value,
    submit,
    abandon,
    status,
    errorMessage,
    ...messageRatingProps
  } = props;

  const hasRating = value !== undefined;

  // TODO: Use this to animate the transition after https://jira.mongodb.org/browse/LG-3965 is merged.
  // const ratingCommentInputVisible = hasRating && status !== "submitted" && status !== "abandoned";

  const ratingCommentRef = useRef(null);

  const isSubmitted = status === "submitted";
  console.log("isSubmitted", isSubmitted);

  return (
    <div
      // TODO: This css is a hacky fix until https://jira.mongodb.org/browse/LG-3965 is merged
      // Once merged we can apply this margin directly to InlineMesssageFeedback
      className={css`
        & > div + div {
          margin-top: 0.5rem;
        }
      `}
    >
      <MessageRating value={value} {...messageRatingProps} />
      {hasRating && status !== "abandoned" ? (
        <>
          <InlineMessageFeedback
            ref={ratingCommentRef}
            // TODO: A custom className depends on https://jira.mongodb.org/browse/LG-3965
            // Once merged, we can use this className to animate a fade out animation with CSSTransition
            // className={styles.message_rating_comment}
            cancelButtonText="Cancel"
            onCancel={() => abandon()}
            submitButtonText="Submit"
            onSubmit={(e) => {
              const form = e.target as HTMLFormElement;
              const textarea = form.querySelector("textarea");
              submit(textarea?.value ?? "");
            }}
            textareaProps={{
              // @ts-expect-error Hacky fix for https://jira.mongodb.org/browse/LG-3964
              label:
                value === "liked"
                  ? "Provide additional feedback here. What did you like about this response?"
                  : "Provide additional feedback here. How can we improve?",
            }}
            isSubmitted={isSubmitted}
            submittedMessage="Submitted! Thank you for your feedback."
            // TODO: we need to define textAreaProps.label instead of the regular label prop until https://jira.mongodb.org/browse/LG-3964 is merged
            // label={
            //   value === "liked"
            //     ? "Provide additional feedback here. What did you like about this response?"
            //     : "Provide additional feedback here. How can we improve?"
            // }
          />
          {errorMessage ? (
            <InlineMessageFeedbackErrorState errorMessage={errorMessage} />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

// TODO: replace this with built-in error state after https://jira.mongodb.org/browse/LG-3966 is merged.
function InlineMessageFeedbackErrorState({
  errorMessage,
}: {
  errorMessage: string;
}) {
  const { darkMode } = useDarkMode();
  return (
    <div
      className={css`
        display: flex;
        gap: ${spacing[1]}px;
        align-items: center;
      `}
    >
      <WarningIcon color={palette.red.base} />
      <Body
        className={css`
          color: ${darkMode ? palette.gray.light1 : palette.gray.dark2};
        `}
      >
        {errorMessage}
      </Body>
    </div>
  );
}
