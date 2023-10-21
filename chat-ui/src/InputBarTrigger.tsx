import { css } from "@emotion/css";
import { palette } from "@leafygreen-ui/palette";
import { LegalDisclosure } from "./LegalDisclosure";
import { Body, Error as ErrorText, Link } from "@leafygreen-ui/typography";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { useLinkData } from "./useLinkData";
import { addQueryParams } from "./utils";
import { type Conversation } from "./useConversation";
import { type ChatbotTriggerProps } from "./ChatbotTrigger";

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
  canSubmit: boolean;
  handleSubmit: (text: string) => void | Promise<void>;
  conversation: Conversation;
  focused: boolean;
  setFocused: (focused: boolean) => void;
  hasError?: boolean;
  inputText: string;
  setInputText: (text: string) => void;
  inputTextError: string;
  inputPlaceholder: string;
  showError?: boolean;
  showSuggestedPrompts?: boolean;
  suggestedPrompts?: string[];
};

export function InputBarTrigger(props: InputBarTriggerProps) {
  return (
    <div className={styles.chatbot_container}>
      <div className={styles.chatbot_input}>
        <InputBar
          key={"initialInput"}
          hasError={props.hasError ?? false}
          badgeText={
            props.focused || props.inputText.length > 0
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
            placeholder: props.inputPlaceholder,
          }}
          onMessageSend={async (messageContent) => {
            if (props.conversation.messages.length > 0) {
              props.openChat();
              return;
            }
            if (props.canSubmit) {
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
            props.setFocused(true);
          }}
          onBlur={() => {
            props.setFocused(false);
          }}
        >
          {props.showSuggestedPrompts ? (
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
          {props.showError ? (
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
