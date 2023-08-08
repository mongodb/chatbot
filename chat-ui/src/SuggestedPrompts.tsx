import Badge from "@leafygreen-ui/badge";
import Card from "@leafygreen-ui/card";
import { MenuItem, MenuItemProps } from "@leafygreen-ui/menu";
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

export type SuggestedPrompt = {
  key: string;
  text: string;
};

type SuggestedPromptsProps = {
  prompts: SuggestedPrompt[];
  onPromptSelected: (text: string) => void;
  suggestedPromptProps?: MenuItemProps;
};

export default function SuggestedPrompts(props: SuggestedPromptsProps) {
  return (
    <Card>
      <div className={styles.prompts_container}>
        <div className={styles.prompts_container_header}>
          <Overline>SUGGESTED AI PROMPTS</Overline>
          <Badge variant="blue">Experimental</Badge>
        </div>
        {props.prompts.map((prompt) => (
          <MenuItem
            key={prompt.key}
            className={styles.prompt}
            onMouseDown={(e) => {
              // By default, onMouseDown fires a blur event, which
              // causes the chat input to blur & unmount this component
              // before onClick runs. We prevent that here so that
              // onClick can actually run.
              e.preventDefault();
            }}
            onClick={() => {
              props.onPromptSelected(prompt.text);
            }}
            {...props.suggestedPromptProps}
          >
            {prompt.text}
          </MenuItem>
        ))}
      </div>
    </Card>
  );
}
