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
  type MessageRatingProps,
  type MessageRatingValue,
} from "@lg-chat/message-rating";
import { Fragment, lazy, Suspense, useState } from "react";
import { useUser, User } from "./useUser";
import { MessageData } from "./services/conversations";
import { Conversation } from "./useConversation";
import { useChatbotContext } from "./useChatbotContext";
import { useLinkData } from "./useLinkData";
import { headingStyle, disableSetextHeadings } from "./markdownHeadingStyle";
import { getMessageLinks } from "./messageLinks";
import { type RatingCommentStatus } from "./MessageRating";

const MessageRatingWithFeedbackComment = lazy(async () => ({
  default: (await import("./MessageRating")).MessageRatingWithFeedbackComment,
}));

const MessagePrompts = lazy(async () => ({
  default: (await import("./MessagePrompts")).MessagePrompts,
}));

const styles = {
  // This is a hacky fix for weird white-space issues in LG Chat.
  markdown_container: css`
    display: flex;
    flex-direction: column;

    & li {
      white-space: normal;
      margin-top: -1rem;
      & ol li, & ul li {
        margin-top: 0.5rem;
      }
    }

    & ol, & ul {
      overflow-wrap: anywhere;
    }

    & h1, & h2, & h3 {
      & +ol, & +ul {
        margin-top: 0;
      }
    }

    & p+h1, & p+h2, & p+h3 {
      margin-top: 1rem;
    }
  `,
  loading_skeleton: css`
    width: 100%;
    min-width: 120px;

    & > div {
      width: 100%;
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
        <Body as="ol" {...props}>
          {children}
        </Body>
      );
    },
    ul: ({ children, ordered, ...props }) => {
      return (
        <Body as="ul" {...props}>
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
  const messageLinks = getMessageLinks(messageData, { tck });

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

        <Suspense fallback={null}>
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
        </Suspense>
      </LGMessage>
      <Suspense fallback={null}>
        {showSuggestedPrompts && (
          <MessagePrompts
            prompts={suggestedPrompts}
            onPromptClick={(prompt) => onSuggestedPromptClick?.(prompt)}
            canSubmit={canSubmitSuggestedPrompt}
          />
        )}
      </Suspense>
    </Fragment>
  );
};
