import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { Error as ErrorText } from "@leafygreen-ui/typography";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { PoweredByAtlasVectorSearch } from "./PoweredByAtlasVectorSearch";
import {
  type ChatbotTextInputTriggerProps,
  useTextInputTrigger,
} from "./useTextInputTrigger";

const styles = {
  info_box: css`
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-left: 8px;
  `,
  chatbot_container: css`
    display: flex;
    flex-direction: column;
    gap: 0.5rem;

    & * {
      box-sizing: border-box;
    }
  }`,
  chatbot_input: css`
    position: relative;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  `,
  powered_by_footer: css`
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    padding-right: 24px;
  `,
};

export type InputBarTriggerProps = ChatbotTextInputTriggerProps & {
  bottomContent?: React.ReactNode;
  suggestedPrompts?: string[];
};

export function InputBarTrigger({
  className,
  suggestedPrompts = [],
  bottomContent,
  fatalErrorMessage = defaultChatbotFatalErrorMessage,
  placeholder,
  darkMode: darkModeProp,
}: InputBarTriggerProps) {
  const { darkMode } = useDarkMode(darkModeProp);

  const {
    conversation,
    isExperimental,
    inputText,
    inputPlaceholder,
    setInputText,
    inputTextError,
    canSubmit,
    awaitingReply,
    openChat,
    focused,
    setFocused,
    handleSubmit,
    hasError,
    showError,
  } = useTextInputTrigger({
    fatalErrorMessage,
    placeholder,
  });

  const showSuggestedPrompts =
    // There are suggested prompts defined
    suggestedPrompts.length > 0 &&
    // There is no conversation history
    conversation.messages.length === 0 &&
    // The user has not typed anything
    inputText.length === 0 &&
    // We're not waiting for the reply to the user's first message
    !awaitingReply;

  return (
    <div className={cx(styles.chatbot_container, className)}>
      <div className={styles.chatbot_input}>
        <InputBar
          key={"inputBarTrigger"}
          darkMode={darkMode}
          hasError={hasError ?? false}
          badgeText={
            !focused && inputText.length === 0 && isExperimental
              ? "Experimental"
              : undefined
          }
          dropdownProps={{
            usePortal: false,
          }}
          dropdownFooterSlot={
            <div className={styles.powered_by_footer}>
              <PoweredByAtlasVectorSearch />
            </div>
          }
          textareaProps={{
            value: inputText,
            onChange: (e) => {
              setInputText(e.target.value);
            },
            placeholder: inputPlaceholder,
          }}
          onMessageSend={async (messageContent) => {
            if (conversation.messages.length > 0) {
              openChat();
              return;
            }
            if (canSubmit) {
              await handleSubmit(messageContent);
            }
          }}
          onClick={async () => {
            if (conversation.messages.length > 0) {
              openChat();
            }
          }}
          onFocus={() => {
            setFocused(true);
          }}
          onBlur={() => {
            setFocused(false);
          }}
        >
          {showSuggestedPrompts ? (
            <SuggestedPrompts label="SUGGESTED AI PROMPTS">
              {suggestedPrompts?.map((suggestedPrompt) => (
                <SuggestedPrompt
                  key={suggestedPrompt}
                  onClick={async () => {
                    await handleSubmit(suggestedPrompt);
                  }}
                >
                  {suggestedPrompt}
                </SuggestedPrompt>
              )) ?? null}
            </SuggestedPrompts>
          ) : undefined}
        </InputBar>

        <div className={styles.info_box}>
          {showError ? <ErrorText>{inputTextError}</ErrorText> : null}
          {bottomContent}
        </div>
      </div>
    </div>
  );
}
