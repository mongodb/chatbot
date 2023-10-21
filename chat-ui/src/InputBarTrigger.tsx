import { css } from "@emotion/css";
import { palette } from "@leafygreen-ui/palette";
import { LegalDisclosure } from "./LegalDisclosure";
import { Body, Error as ErrorText, Link } from "@leafygreen-ui/typography";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { useLinkData } from "./useLinkData";
import { addQueryParams } from "./utils";
import { type Conversation } from "./useConversation";
import { type ChatbotTriggerProps } from "./ChatbotTrigger";
import { useState } from "react";

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
    color: ${palette.gray.dark2};
    justify-content: flex-end;
    padding-right: 24px;
  `,
};

export type InputBarTriggerProps = ChatbotTriggerProps & {
  awaitingReply: boolean;
  handleSubmit: (text: string) => void | Promise<void>;
  conversation: Conversation;
  inputText: string;
  setInputText: (text: string) => void;
  inputTextError: string;
  suggestedPrompts?: string[];
};

export function InputBarTrigger(props: InputBarTriggerProps) {
  const [focused, setFocused] = useState(false); // TODO: Move this to InputBarTrigger
  const canSubmit = props.inputTextError.length === 0 && !props.conversation.error;
  const hasError = props.inputTextError !== "";
  const showError = props.inputTextError !== "" && !open;
  const showSuggestedPrompts =
    (props.suggestedPrompts ?? []).length > 0 &&
    props.inputText.length === 0 &&
    props.conversation.messages.length === 0 &&
    !props.awaitingReply;
  const inputPlaceholder = props.conversation.error
    ? "Something went wrong. Try reloading the page and starting a new conversation."
    : props.awaitingReply
    ? "MongoDB AI is answering..."
    : "Ask MongoDB AI a Question";

  return (
    <div className={styles.chatbot_container}>
      <div className={styles.chatbot_input}>
        <InputBar
          key={"initialInput"}
          hasError={hasError ?? false}
          badgeText={
            focused || props.inputText.length > 0
              ? undefined
              : "Experimental"
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
            // value: !open ? propsinputText : "",
            value: props.inputText,
            onChange: (e) => {
              props.setInputText(e.target.value);
            },
            placeholder: inputPlaceholder,
          }}
          onMessageSend={async (messageContent) => {
            if (props.conversation.messages.length > 0) {
              props.openChat();
              return;
            }
            if (canSubmit) {
              await props.handleSubmit(messageContent);
            }
          }}
          onClick={async () => {
            if (props.conversation.messages.length > 0) {
              props.openChat();
            }
            if (!props.conversation.conversationId) {
              await props.conversation.createConversation();
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
              {props.suggestedPrompts?.map((suggestedPrompt) => (
                <SuggestedPrompt
                  key={suggestedPrompt}
                  onClick={async () => {
                    await props.handleSubmit(suggestedPrompt);
                  }}
                >
                  {suggestedPrompt}
                </SuggestedPrompt>
              )) ?? null}
            </SuggestedPrompts>
          ) : undefined}
        </InputBar>

        <div className={styles.info_box}>
          {showError ? (
            <ErrorText>{props.inputTextError}</ErrorText>
          ) : null}
          <LegalDisclosure />
        </div>
      </div>
    </div>
  );
}

function PoweredByAtlasVectorSearch() {
  const { tck } = useLinkData();
  const url = "https://www.mongodb.com/products/platform/atlas-vector-search";
  return (
    <Body>
      Powered by Atlas Vector Search.{" "}
      <Link href={addQueryParams(url, { tck })} hideExternalIcon>
        Learn More.
      </Link>
    </Body>
  );
}
