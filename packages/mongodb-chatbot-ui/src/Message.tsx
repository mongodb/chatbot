import { css } from "@emotion/css";
import { Body, Link } from "@leafygreen-ui/typography";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import { Avatar, Variant as AvatarVariant } from "@lg-chat/avatar";
import {
  Message as LGMessage,
  type MessageProps as LGMessageProps,
  MessageContent as LGMessageContent,
  type MessageContentProps,
  MessageSourceType,
} from "@lg-chat/message";
import {
  MessagePrompts as LGMessagePrompts,
  MessagePrompt,
} from "@lg-chat/message-prompts";
import {
  MessageRating,
  type MessageRatingProps,
  type MessageRatingValue,
} from "@lg-chat/message-rating";
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
import { CharacterCount } from "./InputBar";
import { useChatbotContext } from "./useChatbotContext";
import { useLinkData } from "./useLinkData";
import { addQueryParams } from "./utils";
import { type RichLinkProps } from "@lg-chat/rich-links";
import { headingStyle, disableSetextHeadings } from "./markdownHeadingStyle";

const TRANSITION_DURATION_MS = 300;

const styles = {
  message_prompts: css`
    margin-left: 70px;
    @media screen and (max-width: 804px) {
      margin-left: 50px;
    }

    transition: opacity ${TRANSITION_DURATION_MS}ms ease-in;

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

    & code {
      white-space: pre-wrap;
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
    min-width: 120px;

    & > div {
      width: 100%;
    }
  `,
  message_rating_comment: css`
    transition: opacity ${TRANSITION_DURATION_MS}ms ease-in;

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

const markdownProps = {
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
} satisfies LGMessageProps["markdownProps"];

const LoadingSkeleton = () => {
  return <ParagraphSkeleton className={styles.loading_skeleton} />;
};

export type MessageProps = {
  messageData: MessageData;
  suggestedPrompts?: string[];
  showSuggestedPrompts?: boolean;
  onSuggestedPromptClick?: (prompt: string) => void;
  canSubmitSuggestedPrompt?: (prompt: string) => boolean;
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

const customMarkdownProps = {
  remarkPlugins: [headingStyle, disableSetextHeadings],
};

export function MessageContent({
  markdownProps: userMarkdownProps,
  ...props
}: MessageContentProps) {
  return (
    <LGMessageContent
      {...props}
      // @ts-expect-error @lg-chat/lg-markdown is using an older version of unified. The types are not compatible but the plugins work. https://jira.mongodb.org/browse/LG-4310
      markdownProps={{
        ...customMarkdownProps,
        ...userMarkdownProps,
      }}
    />
  );
}

export const Message = ({
  messageData,
  suggestedPrompts = [],
  showSuggestedPrompts = true,
  canSubmitSuggestedPrompt = () => true,
  onSuggestedPromptClick,
  isLoading,
  showRating,
  conversation,
}: MessageProps) => {
  const { maxCommentCharacters } = useChatbotContext();
  const user = useUser();
  const info = getMessageInfo(messageData, user);

  const [ratingCommentStatus, setRatingCommentStatus] =
    useState<RatingCommentStatus>("none");

  const [ratingCommentErrorMessage, setRatingCommentErrorMessage] = useState<
    string | undefined
  >();

  const [submittedRatingValue, setSubmittedRatingValue] = useState<
    MessageRatingValue | undefined
  >(undefined);

  async function submitRatingComment(commentText: string) {
    if (!commentText) {
      return;
    }
    try {
      await conversation.commentMessage(messageData.id, commentText);
      setRatingCommentStatus("submitted");
      setSubmittedRatingValue(messageData.rating ? "liked" : "disliked");
      setRatingCommentErrorMessage(undefined);
    } catch (err) {
      setRatingCommentErrorMessage(
        "Oops, there was an issue submitting the response to the server. Please try again."
      );
    }
  }
  function abandonRatingComment() {
    setRatingCommentStatus("abandoned");
  }

  const verifiedAnswer = messageData.metadata?.verifiedAnswer;
  const verified = verifiedAnswer
    ? {
        verifier: "MongoDB Staff",
        verifiedAt: new Date(verifiedAnswer.updated ?? verifiedAnswer.created),
      }
    : undefined;

  const { tck } = useLinkData();
  const messageLinks = messageData.references?.map(
    (reference): RichLinkProps => {
      const richLinkProps = {
        href: addQueryParams(reference.url, { tck }),
        children: reference.title,
      };
      if (reference.linkVariant) {
        return {
          ...richLinkProps,
          variant: reference.linkVariant,
        };
      }
      return richLinkProps;
    }
  );

  return (
    <Fragment key={messageData.id}>
      <LGMessage
        baseFontSize={16}
        isSender={info.isSender}
        avatar={<Avatar variant={info.avatarVariant} name={info.senderName} />}
        sourceType={isLoading ? undefined : MessageSourceType.Markdown}
        markdownProps={markdownProps}
        messageBody={messageData.content}
        verified={verified}
        links={messageLinks}
        componentOverrides={{ MessageContent }}
      >
        {isLoading ? <LoadingSkeleton /> : null}

        {showRating ? (
          <MessageRatingWithFeedbackComment
            submit={submitRatingComment}
            abandon={abandonRatingComment}
            status={ratingCommentStatus}
            errorMessage={ratingCommentErrorMessage}
            clearErrorMessage={() => setRatingCommentErrorMessage(undefined)}
            maxCommentCharacterCount={maxCommentCharacters}
            messageRatingProps={{
              value:
                messageData.rating === undefined
                  ? undefined
                  : messageData.rating
                  ? "liked"
                  : "disliked",
              className: styles.message_rating,
              description: "How was the response?",
              hideThumbsUp: submittedRatingValue === "disliked",
              hideThumbsDown: submittedRatingValue === "liked",
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
            }}
          />
        ) : null}
      </LGMessage>
      {showSuggestedPrompts && (
        <MessagePrompts
          messagePrompts={suggestedPrompts}
          messagePromptsOnClick={(prompt) => onSuggestedPromptClick?.(prompt)}
          canSubmitSuggestedPrompt={canSubmitSuggestedPrompt}
        />
      )}
    </Fragment>
  );
};

export type MessagePromptsProps = {
  messagePrompts: string[];
  messagePromptsOnClick: (prompt: string) => void;
  canSubmitSuggestedPrompt: (prompt: string) => boolean;
};

export const MessagePrompts = ({
  messagePrompts,
  messagePromptsOnClick,
  canSubmitSuggestedPrompt,
}: MessagePromptsProps) => {
  const [selectedSuggestedPromptIndex, setSelectedSuggestedPromptIndex] =
    useState<number | undefined>(undefined);
  const nodeRef = useRef(null);

  // This ref is used to prevent the user from clicking a suggested
  // prompt multiple times. We use a ref instead of state to ensure that
  // the prompt is only selected and sent to the server once regardless
  // of where we are in the React render cycle.
  const suggestedPromptClickedRef = useRef(false);
  const onPromptSelected = (prompt: string, idx: number) => {
    // Don't do anything if the prompt is not selectable.
    if (!canSubmitSuggestedPrompt(prompt)) {
      return;
    }
    // Check the ref to prevent the prompt from being clicked multiple
    // times. This might happen if the user clicks the prompt again
    // while the list of prompts is animating out.
    if (suggestedPromptClickedRef.current) {
      return;
    }
    suggestedPromptClickedRef.current = true;
    setSelectedSuggestedPromptIndex(idx);
    // Wait for the prompts to fully animate out before calling the
    // click handler.
    setTimeout(() => {
      messagePromptsOnClick(prompt);
    }, TRANSITION_DURATION_MS);
  };

  return (
    <CSSTransition
      in={selectedSuggestedPromptIndex === undefined}
      timeout={TRANSITION_DURATION_MS}
      nodeRef={nodeRef}
      classNames={styles.message_prompts}
    >
      <div className={styles.message_prompts} ref={nodeRef}>
        <LGMessagePrompts label="Suggested Prompts">
          {messagePrompts.map((suggestedPrompt, idx) => (
            <MessagePrompt
              key={suggestedPrompt}
              onClick={() => onPromptSelected(suggestedPrompt, idx)}
              selected={idx === selectedSuggestedPromptIndex}
            >
              {suggestedPrompt}
            </MessagePrompt>
          ))}
        </LGMessagePrompts>
      </div>
    </CSSTransition>
  );
};

export type MessageRatingWithFeedbackCommentProps = {
  submit: (commentText: string) => void | Promise<void>;
  abandon: () => void;
  status: "none" | "submitted" | "abandoned";
  errorMessage?: string;
  clearErrorMessage?: () => void;
  maxCommentCharacterCount?: number;
  messageRatingProps: MessageRatingProps;
};

export function MessageRatingWithFeedbackComment(
  props: MessageRatingWithFeedbackCommentProps
) {
  const {
    submit,
    abandon,
    status,
    errorMessage,
    maxCommentCharacterCount,
    messageRatingProps,
  } = props;

  const hasRating = messageRatingProps.value !== undefined;

  // TODO: Use this to animate the transition after https://jira.mongodb.org/browse/LG-3965 is merged.
  // const ratingCommentInputVisible = hasRating && status !== "submitted" && status !== "abandoned";

  const ratingCommentRef = useRef(null);

  const isSubmitted = status === "submitted";

  const [characterCount, setCharacterCount] = useState(0);

  const characterCountExceeded = maxCommentCharacterCount
    ? characterCount > maxCommentCharacterCount
    : false;

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
      <MessageRating {...messageRatingProps} />
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
            onSubmit={async (e) => {
              const form = e.target as HTMLFormElement;
              const textarea = form.querySelector("textarea");
              if (!characterCountExceeded) {
                await submit(textarea?.value ?? "");
              }
            }}
            textareaProps={{
              onChange: (e) => {
                const textarea = e.target as HTMLTextAreaElement;
                setCharacterCount(textarea.value.length);
              },
              // @ts-expect-error Hacky fix for https://jira.mongodb.org/browse/LG-3964
              label:
                messageRatingProps.value === "liked"
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

          {maxCommentCharacterCount && status !== "submitted" ? (
            <div
              className={css`
                margin-top: -2rem !important;
                display: flex;
                flex-direction: row;
                gap: 0.5rem;
              `}
            >
              <CharacterCount
                current={characterCount}
                max={maxCommentCharacterCount}
              />
              {characterCountExceeded ? (
                <Body
                  className={css`
                    color: ${palette.red.base};
                  `}
                >
                  {`Message must contain ${maxCommentCharacterCount} characters or fewer`}
                </Body>
              ) : null}
            </div>
          ) : null}

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
