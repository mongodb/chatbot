import TextInput, { TextInputProps } from "@leafygreen-ui/text-input";
import Icon, { glyphs } from "@leafygreen-ui/icon";

import styles from "./TextInput.module.css";
import { useKeyPress } from "./useKeyPress";

type IconInputProps = Omit<TextInputProps, "sizeVariant" | "state"> & {
  glyph: keyof typeof glyphs;
  "aria-label": string;
};

export function IconInput({ glyph, ...props }: IconInputProps) {
  if (!props["aria-label"]) {
    console.warn("IconInput requires an aria-label prop");
  }
  return (
    <div className={styles.input_wrapper}>
      <TextInput
        className={styles.input_field}
        sizeVariant="small"
        state="none"
        {...props}
      />
      <Icon className={styles.input_icon} glyph={glyph} />
    </div>
  );
}

type SpecificIconInputProps = Omit<IconInputProps, "glyph" | "aria-label"> & {
  // onSubmit: (text: string) => void
};

export function ChatInput(props: SpecificIconInputProps) {
  useKeyPress("Enter", (e) => {
    console.log("Enter key pressed", e);
  })

  return (
    <IconInput
      glyph="SMS"
      aria-label="MongoDB AI Chatbot Message Input"
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
      placeholder="Ask MongoDB AI a Question"
      {...props}
    />
  );
}
