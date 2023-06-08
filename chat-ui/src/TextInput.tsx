import TextInput, { TextInputProps } from "@leafygreen-ui/text-input";
import Icon, { glyphs } from "@leafygreen-ui/icon";

import styles from "./TextInput.module.css";
import { useKeyPress } from "./useKeyPress";

type IconInputProps = Omit<TextInputProps, "sizeVariant" | "state"> & {
  glyph: keyof typeof glyphs;
  "aria-label": string;
  "aria-labelledby": string;
};

export function IconInput({ glyph, ...props }: IconInputProps) {
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

type SpecificIconInputProps = Omit<IconInputProps, "glyph" | "aria-label" | "aria-labelledby"> & {
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
