import TextInput from "@leafygreen-ui/text-input";
import Icon, { glyphs } from "@leafygreen-ui/icon";

import styles from "./IconInput.module.css";
import { useState } from "react";

type IconInputProps = {
  glyph: keyof typeof glyphs;
  "aria-label": string;
  "aria-labelledby": string;
  placeholder: string;
  onSubmit?: (text: string) => void;
};

export type SpecificIconInputProps = Pick<IconInputProps, "onSubmit">;

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
