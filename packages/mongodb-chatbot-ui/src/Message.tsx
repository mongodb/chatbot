import { css } from "@emotion/css";
import { ParagraphSkeleton } from "@leafygreen-ui/skeleton-loader";
import { Avatar, Variant as AvatarVariant } from "@lg-chat/avatar";
import { MessageContent } from "./MessageContent";
import { Message as LGMessage, MessageSourceType } from "@lg-chat/message";
import { type MessageRatingProps } from "@lg-chat/message-rating";
import { Fragment, lazy, Suspense, useState } from "react";
import { useUser } from "./useUser";
import { useChatbotContext } from "./useChatbotContext";
import { useLinkData } from "./useLinkData";
import { getMessageLinks } from "./messageLinks";
import { RatingValue, type RatingCommentStatus } from "./MessageRating";
import { AssistantMessageData } from "./services/conversations";

const MessageRatingPromise = import("./MessageRating");
const MessageRatingWithFeedbackComment = lazy(async () => ({
  default: (await MessageRatingPromise).MessageRatingWithFeedbackComment,
}));

const MessagePromptsPromise = import("./MessagePrompts");
const MessagePrompts = lazy(async () => ({
  default: (await MessagePromptsPromise).MessagePrompts,
}));

const LoadingSkeleton = () => {
  return (
    <ParagraphSkeleton
      className={css`
        width: 100%;
        min-width: 120px;

        & > div {
          width: 100%;
        }
      `}
    />
  );
};

export type SomeMessageProps = {
  className?: string;
  content: string;
  id: string;
};

export type UserMessageProps = SomeMessageProps;

export function UserMessage({ className, content }: UserMessageProps) {
  const user = useUser();
  return (
    <LGMessage
      className={className}
      isSender
      avatar={<Avatar variant={AvatarVariant.User} name={user?.name} />}
      sourceType={MessageSourceType.Markdown}
      messageBody={content}
    />
  );
}

export type AssistantMessageProps = SomeMessageProps & {
  isLoading: boolean;
  rating?: {
    value?: RatingValue;
    comment?: string;
  };
  references?: AssistantMessageData["references"];
  suggestedPrompts?: {
    prompts: string[];
    onClick: (prompt: string) => void;
    canSubmit: (prompt: string) => boolean;
  };
  verified?: {
    verifier: string;
    verifiedAt: Date;
  };
};

export function AssistantMessage({
  id: messageId,
  content,
  isLoading,
  rating,
  references,
  suggestedPrompts,
  verified,
}: AssistantMessageProps) {
  const { chatbotName, conversation, maxCommentCharacters } =
    useChatbotContext();

  const [submittedRating, setSubmittedRating] = useState<
    RatingValue | undefined
  >();

  const [userComment, setUserComment] = useState<{
    status: RatingCommentStatus;
    text?: string;
    errorMessage?: string;
  }>({
    status: "none",
  });
  const setUserCommentText = (text: string) => {
    setUserComment((prev) => ({ ...prev, text }));
  };
  const setUserCommentError = (errorMessage?: string) => {
    setUserComment((prev) => ({ ...prev, errorMessage }));
  };

  function abandonUserComment() {
    setUserComment({
      status: "abandoned",
      text: undefined,
      errorMessage: undefined,
    });
  }

  async function submitUserComment() {
    if (!userComment.text) {
      // The user can't submit an empty comment
      return;
    }
    if (rating?.value === undefined) {
      // The user can't submit a comment without first submitting a rating
      return;
    }
    try {
      await conversation.commentMessage(messageId, userComment.text);
      setUserComment({
        ...userComment,
        status: "submitted",
        errorMessage: undefined,
      });
      setSubmittedRating(rating.value);
    } catch (err) {
      setUserCommentError(
        "There was an issue submitting the response to the server. Please try again."
      );
    }
  }

  const { tck } = useLinkData();
  const messageLinks = getMessageLinks(references, { tck });

  return (
    <Fragment key={messageId}>
      <LGMessage
        baseFontSize={16}
        isSender={false}
        avatar={<Avatar variant={AvatarVariant.Mongo} name={chatbotName} />}
        sourceType={MessageSourceType.Markdown}
        messageBody={content}
        verified={verified}
        links={messageLinks}
        componentOverrides={{ MessageContent }}
      >
        {isLoading ? <LoadingSkeleton /> : null}

        <Suspense fallback={null}>
          {rating ? (
            <MessageRatingWithFeedbackComment
              submit={submitUserComment}
              abandon={abandonUserComment}
              status={userComment.status}
              errorMessage={userComment.errorMessage}
              clearErrorMessage={() => setUserCommentError(undefined)}
              maxCommentCharacterCount={maxCommentCharacters}
              onCommentChange={setUserCommentText}
              messageRatingProps={{
                value: rating.value,
                description: "How was the response?",
                hideThumbsUp: submittedRating === "disliked",
                hideThumbsDown: submittedRating === "liked",
                onChange: async (e) => {
                  const value = e.target.value as MessageRatingProps["value"];
                  if (!value) {
                    return;
                  }
                  if (userComment.status === "submitted") {
                    // Once a user has submitted a comment for their rating we don't want them to be able to change their rating
                    return;
                  }
                  await conversation.rateMessage(
                    messageId,
                    value === "liked" ? true : false
                  );
                },
              }}
            />
          ) : null}
        </Suspense>
      </LGMessage>
      <Suspense fallback={null}>
        {suggestedPrompts ? (
          <MessagePrompts
            prompts={suggestedPrompts.prompts}
            onPromptClick={(prompt) => suggestedPrompts.onClick?.(prompt)}
            canSubmit={suggestedPrompts.canSubmit}
          />
        ) : null}
      </Suspense>
    </Fragment>
  );
}

export function Message(
  props:
    | ({ role: "user" } & UserMessageProps)
    | ({ role: "assistant" } & AssistantMessageProps)
) {
  switch (props.role) {
    case "user":
      return <UserMessage {...props} />;
    case "assistant":
      return <AssistantMessage {...props} />;
  }
}
