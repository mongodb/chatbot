import { forwardRef } from "react";
import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import { Overline, Body } from "@leafygreen-ui/typography";
import { palette } from "@leafygreen-ui/palette";
import { css, cx } from "@emotion/css";

const styles = {
  menu_card: css`
    border-radius: 16px;
    padding-bottom: 16px;
  `,
  prompts_container: css`
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    list-style-type: none;
  `,
  prompts_container_header: css`
    display: flex;
    flex-direction: row;
    gap: 0.5rem;
    align-items: left;
  `,
  prompt: css`
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    background: #ffffff;
    color: #000000;

    &:hover, &:focus {
      cursor: pointer;
      background: #e1f7ff;
    }
  `,
  powered_by_footer: css`
    display: flex;
    flex-direction: row;
    color: ${palette.gray.dark2};
    justify-content: flex-end;
  `,
};

export type MenuPrompt = {
  key: string;
  text: string;
};

type InputMenuProps = {
  heading?: string;
  headingBadgeText?: string;
  poweredByText?: string;
  prompts: MenuPrompt[];
  onPromptFocused?: (promptIndex: number) => void;
  onPromptBlur?: (promptIndex: number) => void;
  onPromptSelected: (prompt: MenuPrompt) => void;
  className: React.HTMLAttributes<HTMLDivElement>["className"];
  // menuItemProps?: MenuItemProps;
};

export const InputMenu = forwardRef(function InputMenu(props: InputMenuProps, ref: React.ForwardedRef<HTMLDivElement>) {
  return (
    <Card className={cx(styles.menu_card, props.className)}>
      <div className={styles.prompts_container} ref={ref}>
        {props.heading ? (
          <div className={styles.prompts_container_header}>
            <Overline>{props.heading}</Overline>
            {props.headingBadgeText ? (
              <Badge variant="blue">{props.headingBadgeText}</Badge>
            ) : null}
          </div>
        ) : null}
        {props.prompts.map((prompt, i) => (
          <div
            key={prompt.key}
            role="button"
            className={styles.prompt}
            tabIndex={0}
            onMouseDown={(e) => {
              // By default, onMouseDown fires a blur event, which
              // causes the chat input to blur & unmount this component
              // before onClick runs. We prevent that here so that
              // onClick can actually run.
              e.preventDefault();
            }}
            onClick={() => {
              props.onPromptSelected(prompt);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                props.onPromptSelected(prompt);
              }
            }}
            onFocusCapture={() => {
              props.onPromptFocused?.(i);
            }}
            onBlur={() => {
              props.onPromptBlur?.(i);
            }}
          >
            {prompt.text}
          </div>
        ))}
        <div className={styles.powered_by_footer}>
          <Body>{props.poweredByText}</Body>
        </div>
      </div>
    </Card>
  );
})
