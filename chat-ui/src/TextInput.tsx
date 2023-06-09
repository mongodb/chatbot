import TextInput, { TextInputProps } from "@leafygreen-ui/text-input";
import Icon, { glyphs } from "@leafygreen-ui/icon";

import styles from "./TextInput.module.css";
import { useState } from "react";

type IconInputProps = {
  glyph: keyof typeof glyphs;
  "aria-label": string;
  "aria-labelledby": string;
  placeholder: string;
  onSubmit: (text: string) => void;
};

export function IconInput({ onSubmit, ...props }: IconInputProps) {
  const [inputText, setInputText] = useState("");

  return (
    <div className={styles.input_wrapper}>
      <TextInput
        value={inputText}
        className={styles.input_field}
        sizeVariant="small"
        state="none"
        onChange={(e) => {
          setInputText(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onSubmit?.(inputText);
            setInputText("");
          }
        }}
        {...props}
      />
      <Icon className={styles.input_icon} glyph={props.glyph} />
    </div>
  );
}

type SpecificIconInputProps = Pick<IconInputProps, "onSubmit">;

export function ChatInput(props: SpecificIconInputProps) {
  return (
    <IconInput
      glyph="SMS"
      aria-label="MongoDB AI Chatbot Message Input"
      aria-labelledby="TBD - FIXME"
      placeholder={`Type a message or type "/" to select a prompt`}
      {...props}
    />
  );
}

export function WizardInput(props: SpecificIconInputProps) {
  return (
    <IconInput
      glyph="Wizard"
      aria-label="MongoDB AI Chatbot Message Input"
      aria-labelledby="TBD - FIXME"
      placeholder="Ask MongoDB AI a Question"
      {...props}
    />
  );
}
