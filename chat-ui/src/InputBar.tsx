import { css } from "@emotion/css";
import { palette } from "@leafygreen-ui/palette";
import { Body } from "@leafygreen-ui/typography";
import {
  InputBar as LGInputBar,
  InputBarProps as LGInputBarProps,
} from "@lg-chat/input-bar";
import { forwardRef } from "react";
export { SuggestedPrompts, SuggestedPrompt } from "@lg-chat/input-bar";
import { type StylesProps } from "./utils";

const styles = {
  chatbot_input_error_border: css`
    > div {
      > div {
        border-color: ${palette.red.base} !important;
        border-width: 2px !important;
      }
    }
  `,
  character_count: ({
    darkMode,
    isError,
  }: StylesProps & { isError: boolean }) => css`
    color: ${isError
      ? palette.red.base
      : darkMode
      ? palette.gray.light2
      : palette.gray.dark2};
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
        className={
          hasError ?? false ? styles.chatbot_input_error_border : undefined
        }
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
}

export function CharacterCount({
  current,
  max,
  darkMode,
}: CharacterCountProps) {
  return (
    <Body
      className={styles.character_count({
        darkMode,
        isError: current > max,
      })}
    >
      {`${current} / ${max}`}
    </Body>
  );
}
