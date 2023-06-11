import TextInput, { TextInputProps } from "@leafygreen-ui/text-input";
import Icon, { glyphs } from "@leafygreen-ui/icon";

import styles from "./IconInput.module.css";
import { forwardRef } from "react";

export type IconInputProps = TextInputProps & {
  glyph: keyof typeof glyphs;
};

export type SpecificIconInputProps = Pick<IconInputProps, "onSubmit">;

export const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  function IconInput(props: IconInputProps, ref) {
    return (
      <div className={styles.input_wrapper}>
        <TextInput
          ref={ref}
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
);
