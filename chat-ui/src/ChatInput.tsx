import styles from "./ChatInput.module.css";
import { forwardRef, useRef } from "react";
import Icon from "@leafygreen-ui/icon";
import Button from "@leafygreen-ui/button";
import { Spinner } from "@leafygreen-ui/loading-indicator";
import IconInput, { IconInputProps } from "./IconInput";
import { mergeRefs } from "react-merge-refs";

export type ChatInputProps = Omit<
  IconInputProps,
  "aria-label" | "aria-labelledby" | "glyph"
> & {
  inputGlyph?: IconInputProps["glyph"];
  sendButtonGlyph?: IconInputProps["glyph"];
  showSubmitButton: boolean;
  loading?: boolean;
  handleSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
  onButtonClick?: (e: React.MouseEvent) => void;
};

const ChatInput = forwardRef<HTMLInputElement, ChatInputProps>(
  function ChatInput(
    {
      onChange,
      inputGlyph,
      sendButtonGlyph,
      showSubmitButton,
      loading = false,
      handleSubmit,
      onButtonClick,
      ...props
    },
    ref
  ) {
    const localRef = useRef<HTMLInputElement>(null);
    const inputRef = mergeRefs([ref, localRef]);

    return (
      <div className={styles.chat_input_container}>
        <form
          className={styles.input_form}
          onSubmit={(e) => {
            e.preventDefault();
            // const inputText = (e.currentTarget.elements.namedItem("chatbotInput") as HTMLInputElement).value;
            handleSubmit?.(e);
          }}
        >
          <IconInput
            ref={inputRef}
            name="chatbotInput"
            glyph={inputGlyph ?? "Wizard"}
            aria-label="MongoDB AI Chatbot Input"
            aria-labelledby="MongoDB AI Chatbot Input"
            sizeVariant="small"
            state="none"
            onInvalid={(e) => {
              (e.target as HTMLObjectElement).setCustomValidity(
                "Please enter a message"
              );
            }}
            onChange={(e) => {
              (e.target as unknown as HTMLObjectElement).setCustomValidity("");
              onChange?.(e);
            }}
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
              {loading ? (
                <Spinner displayOption="default-horizontal" />
              ) : (
                "Send"
              )}
            </Button>
          ) : null}
        </form>
      </div>
    );
  }
);
export default ChatInput;
