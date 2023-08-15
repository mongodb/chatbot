import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import { Overline } from "@leafygreen-ui/typography";
import { css } from "@emotion/css";

const styles = {
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

    &:hover {
      cursor: pointer;
      background: #e1f7ff;
    }
  `,
};

export type MenuPrompt = {
  key: string;
  text: string;
};

type InputMenuProps = {
  heading?: string;
  headingBadgeText?: string;
  prompts: MenuPrompt[];
  onPromptFocused?: (promptIndex: number) => void;
  onPromptBlur?: (promptIndex: number) => void;
  onPromptSelected: (prompt: MenuPrompt) => void;
  // menuItemProps?: MenuItemProps;
};

export function InputMenu(props: InputMenuProps) {
  return (
    <Card>
      <div className={styles.prompts_container}>
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
      </div>
    </Card>
  );
}
