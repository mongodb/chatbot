import styles from "./ChatInput.module.css";
import { forwardRef } from "react";
import Icon from "@leafygreen-ui/icon";
import Button from "@leafygreen-ui/button";
import { Spinner } from "@leafygreen-ui/loading-indicator";
import IconInput, { IconInputProps } from "./IconInput";

export type ChatInputProps = Omit<
  IconInputProps,
  "aria-label" | "aria-labelledby" | "glyph"
> & {
  inputGlyph?: IconInputProps["glyph"];
  sendButtonGlyph?: IconInputProps["glyph"];
  showSubmitButton: boolean;
  loading?: boolean;
  onButtonClick?: (e: MouseEvent) => void;
};

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput(
    {
      inputGlyph,
      sendButtonGlyph,
      showSubmitButton,
      loading = false,
      onButtonClick,
      ...props
    },
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
            onClick={(e) => {
              onButtonClick?.(e);
            }}
            disabled={loading}
          >
            {loading ? <Spinner displayOption="default-horizontal" /> : "Send"}
          </Button>
        ) : null}
      </div>
    );
  }
);
export default ChatInput;
