import { css } from "@emotion/css";
import { Body } from "@leafygreen-ui/typography";
import {
  MessageRating,
  type MessageRatingProps,
} from "@lg-chat/message-rating";
import { useRef, useState } from "react";
import { InlineMessageFeedback } from "@lg-chat/message-feedback";
// @ts-expect-error Typescript imports of icons currently not supported
import WarningIcon from "@leafygreen-ui/icon/dist/Warning";
import { spacing } from "@leafygreen-ui/tokens";
import { palette } from "@leafygreen-ui/palette";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { CharacterCount } from "./InputBar";

export type RatingCommentStatus = "none" | "submitted" | "abandoned";

export type MessageRatingWithFeedbackCommentProps = {
  submit: (commentText: string) => void | Promise<void>;
  abandon: () => void;
  status: RatingCommentStatus;
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
export function InlineMessageFeedbackErrorState({
  errorMessage,
}: {
  errorMessage: string;
}) {
  const { darkMode } = useDarkMode();
  return (
    <div
      className={css`
        display: flex;
        gap: ${spacing[100]}px;
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
