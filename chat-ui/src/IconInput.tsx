import TextInput, { TextInputProps } from "@leafygreen-ui/text-input";
import Icon, { glyphs } from "@leafygreen-ui/icon";

import styles from "./IconInput.module.css";

export type IconInputProps = TextInputProps & {
  glyph: keyof typeof glyphs;
};

export type SpecificIconInputProps = Pick<IconInputProps, "onSubmit">;

export function IconInput(props: IconInputProps) {
  return (
    <div className={styles.input_wrapper}>
      <TextInput
        aria-label="Text input with an icon"
        className={styles.input_field}
        sizeVariant="small"
        state="none"
        {...props}
      />
      <Icon className={styles.input_icon} glyph={props.glyph} />
    </div>
  );
}
