import { css } from "@emotion/css";
import {
  MessagePrompts as LGMessagePrompts,
  MessagePrompt,
} from "@lg-chat/message-prompts";
import { useRef, useState } from "react";
import { CSSTransition } from "react-transition-group";

const PROMPT_TRANSITION_DURATION_MS = 400;
const styles = {
  message_prompts: css`
    margin-left: 70px;
    @media screen and (max-width: 804px) {
      margin-left: 50px;
    }

    transition: opacity ${PROMPT_TRANSITION_DURATION_MS}ms ease-in;

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

export type MessagePromptsProps = {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  canSubmit: (prompt: string) => boolean;
};

export const MessagePrompts = ({
  prompts,
  onPromptClick,
  canSubmit,
}: MessagePromptsProps) => {
  const [selectedPromptIndex, setSelectedPromptIndex] = useState<
    number | undefined
  >(undefined);
  const nodeRef = useRef(null);

  // This ref is used to prevent the user from clicking a suggested
  // prompt multiple times. We use a ref instead of state to ensure that
  // the prompt is only selected and sent to the server once regardless
  // of where we are in the React render cycle.
  const suggestedPromptClickedRef = useRef(false);
  const onPromptSelected = (prompt: string, idx: number) => {
    // Don't do anything if the prompt is not selectable.
    if (!canSubmit(prompt)) {
      return;
    }
    // Check the ref to prevent the prompt from being clicked multiple
    // times. This might happen if the user clicks the prompt again
    // while the list of prompts is animating out.
    if (suggestedPromptClickedRef.current) {
      return;
    }
    suggestedPromptClickedRef.current = true;
    setSelectedPromptIndex(idx);
    // Wait for the prompts to fully animate out before calling the
    // click handler.
    setTimeout(() => {
      onPromptClick(prompt);
    }, PROMPT_TRANSITION_DURATION_MS);
  };

  return (
    <CSSTransition
      in={selectedPromptIndex === undefined}
      timeout={PROMPT_TRANSITION_DURATION_MS}
      nodeRef={nodeRef}
      classNames={styles.message_prompts}
    >
      <div className={styles.message_prompts} ref={nodeRef}>
        <LGMessagePrompts label="Suggested Prompts">
          {prompts.map((prompt, idx) => (
            <MessagePrompt
              key={prompt}
              onClick={() => onPromptSelected(prompt, idx)}
              selected={idx === selectedPromptIndex}
            >
              {prompt}
            </MessagePrompt>
          ))}
        </LGMessagePrompts>
      </div>
    </CSSTransition>
  );
};
