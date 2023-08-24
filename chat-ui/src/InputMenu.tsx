import { forwardRef } from "react";
import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import { Overline, Body, Link } from "@leafygreen-ui/typography";
import { palette } from "@leafygreen-ui/palette";
import { css, cx } from "@emotion/css";
import { addPeriodIfMissing } from "./utils";

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
    align-items: left;
    margin-bottom: 0.5rem;
  `,
  prompt: css`
    padding: 0.25rem 0.5rem;
    border-radius: 6px;
    background: #ffffff;
    color: #000000;

    &:hover,
    &:focus {
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
  poweredByText: string;
  poweredByCTA: string;
  poweredByLink: string;
  prompts: MenuPrompt[];
  onFocused?: (i: number) => void;
  onBlurred?: (i: number) => void;
  onPromptSelected: (prompt: MenuPrompt) => void;
  className: React.HTMLAttributes<HTMLDivElement>["className"];
};

export const InputMenu = forwardRef(function InputMenu(
  props: InputMenuProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  return (
    <Card
      className={cx(styles.menu_card, props.className)}
      id="input-menu-card"
    >
      {props.heading ? (
        <div className={styles.prompts_container_header}>
          <Overline role="heading" aria-level="2">
            {props.heading}
          </Overline>
          {props.headingBadgeText ? (
            <Badge variant="blue">{props.headingBadgeText}</Badge>
          ) : null}
        </div>
      ) : null}
      <div
        className={styles.prompts_container}
        ref={ref}
        role="menu"
        aria-label="MongoDB Chatbot Suggested Inputs"
      >
        {props.prompts.map((prompt, i) => (
          <div
            key={prompt.key}
            role="menuitem"
            aria-label={prompt.text}
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
              props.onFocused?.(i);
            }}
            onBlur={() => {
              props.onBlurred?.(i);
            }}
          >
            {prompt.text}
          </div>
        ))}
      </div>
      <div className={styles.powered_by_footer}>
        <Body>
          {addPeriodIfMissing(props.poweredByText)}{" "}
          <Link
            href={props.poweredByLink}
            onFocusCapture={() => {
              props.onFocused?.(props.prompts.length);
            }}
            onBlur={() => {
              props.onBlurred?.(props.prompts.length);
            }}
          >
            {addPeriodIfMissing(props.poweredByCTA)}
          </Link>
        </Body>
      </div>
    </Card>
  );
});
