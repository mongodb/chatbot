import Badge from "@leafygreen-ui/badge";
import { Overline, Body } from "@leafygreen-ui/typography";

import styles from "./SuggestedPrompts.module.css";

type SuggestedPromptsProps = {
  onPromptSelected: (text: string) => void;
};

export default function SuggestedPrompts(props: SuggestedPromptsProps) {
  const suggestedPrompts = [
    { key: "deploy", text: "How do you deploy a free cluster in Atlas?" },
    {
      key: "import",
      text: "How do you import or migrate data into MongoDB Atlas?",
    },
    { key: "get-started", text: "Get started with MongoDB" },
    { key: "why-search", text: "Why should I use Atlas Search?" },
  ];
  return (
    <div className={styles.prompts_container}>
      <div className={styles.prompts_container_header}>
        <Overline>SUGGESTED AI PROMPTS</Overline>
        <Badge variant="blue">Experimental</Badge>
      </div>
      {suggestedPrompts.map((prompt) => (
        <Body
          key={prompt.key}
          className={styles.prompt}
          onClick={() => {
            props.onPromptSelected(prompt.text);
          }}
        >
          {prompt.text}
        </Body>
      ))}
    </div>
  );
}
