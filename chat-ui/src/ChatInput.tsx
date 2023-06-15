import styles from "./ChatInput.module.css";
import { forwardRef } from "react";
import Icon from "@leafygreen-ui/icon";
import Button from "@leafygreen-ui/button";
import IconInput, { IconInputProps } from "./IconInput";

export type ChatInputProps = Omit<
  IconInputProps,
  "aria-label" | "aria-labelledby" | "glyph"
> & {
  inputGlyph?: IconInputProps["glyph"];
  sendButtonGlyph?: IconInputProps["glyph"];
  showSubmitButton: boolean;
};

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput(
    { inputGlyph, sendButtonGlyph, showSubmitButton, ...props },
    ref
  ) {
    return (
      <div className={styles.chat_input_container}>
        <IconInput
          ref={ref}
          glyph={inputGlyph ?? "Wizard"}
          aria-label="MongoDB AI Chatbot Input"
          aria-labelledby="MongoDB AI Chatbot Input"
          sizeVariant="small"
          state="none"
          {...props}
        />
        {showSubmitButton ? (
          <Button
            className={styles.input_form_submit}
            type="submit"
            rightGlyph={sendButtonGlyph && <Icon glyph={sendButtonGlyph} />}
          >
            Send
          </Button>
        ) : null}
      </div>
    );
  }
);
export default ChatInput;
