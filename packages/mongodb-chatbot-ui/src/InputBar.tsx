import { css, cx } from "@emotion/css";
import { palette } from "@leafygreen-ui/palette";
import { Body } from "@leafygreen-ui/typography";
import {
  InputBar as LGInputBar,
  InputBarProps as LGInputBarProps,
} from "@lg-chat/input-bar";
import { forwardRef } from "react";
export { SuggestedPrompts, SuggestedPrompt } from "@lg-chat/input-bar";
import { type StylesProps } from "./utils";
import { useChatbotContext } from "./useChatbotContext";

const styles = {
  chatbot_input_error_border: css`
    > div {
      > div {
        border-color: ${palette.red.base} !important;
        border-width: 2px !important;
      }
    }
  `,
  suggested_prompts_menu: css`
    [data-testid="lg-search-input-popover"] {
      z-index: 1;
    }
  `,
  character_count: ({
    darkMode,
    isError,
  }: StylesProps & { isError: boolean }) => css`
    white-space: nowrap;
    color: ${
      isError
        ? palette.red.base
        : darkMode
        ? palette.gray.light2
        : palette.gray.dark2
    };
  `,
};

export interface InputBarProps extends LGInputBarProps {
  hasError?: boolean;
}

export const InputBar = forwardRef<HTMLFormElement, InputBarProps>(
  function InputBar({ children, hasError, ...props }, ref) {
    return (
      <LGInputBar
        ref={ref}
        className={cx(
          styles.suggested_prompts_menu,
          hasError ?? false ? styles.chatbot_input_error_border : undefined
        )}
        shouldRenderGradient={!hasError}
        {...props}
      >
        {children}
      </LGInputBar>
    );
  }
);

export interface CharacterCountProps {
  current: number;
  max: number;
  darkMode?: boolean;
  className?: HTMLElement["className"];
}

export function CharacterCount({
  current,
  max,
  darkMode,
  className,
}: CharacterCountProps) {
  return (
    <Body
      className={cx(
        styles.character_count({
          darkMode,
          isError: current > max,
        }),
        className
      )}
    >
      {`${current} / ${max}`}
    </Body>
  );
}

export function MongoDbInputBarPlaceholder() {
  const { awaitingReply, chatbotName } = useChatbotContext();
  if (awaitingReply) {
    return chatbotName ? `${chatbotName} is answering...` : "Answering...";
  }
  return chatbotName ? `Ask ${chatbotName} a Question` : "Ask a Question";
}
