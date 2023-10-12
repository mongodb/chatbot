import { css } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { palette } from "@leafygreen-ui/palette";
import { Body, Error as ErrorText, Link } from "@leafygreen-ui/typography";
import { useState } from "react";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { addQueryParams } from "./utils";
import { ChatbotModal } from "./ChatbotModal";
import { useLinkData } from "./useLinkData";
import { InnerChatbotProps } from "./Chatbot";
import { LegalDisclosure } from "./LegalDisclosure";

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
    margin-top: 1rem;
  `,
  chatbot_input_area: css`
    padding-left: 32px;
    padding-right: 32px;
    padding-top: 0.5rem;
    padding-bottom: 1rem;
  `,
  powered_by_footer: css`
    display: flex;
    flex-direction: row;
    color: ${palette.gray.dark2};
    justify-content: flex-end;
    padding-right: 24px;
  `,
};

export function DocsChatbot(props: InnerChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const {
    conversation,
    openChat,
    closeChat,
    awaitingReply,
    inputBarRef,
    inputText,
    setInputText,
    inputTextError,
    handleSubmit,
    open,
    suggestedPrompts,
  } = props;

  const showSuggestedPrompts =
    (suggestedPrompts ?? []).length > 0 &&
    inputText.length === 0 &&
    conversation.messages.length === 0 &&
    !awaitingReply;

  const [initialInputFocused, setInitialInputFocused] = useState(false);
  const showInitialInputErrorState = inputTextError !== "" && !open;

  return (
    <div className={styles.chatbot_container}>
      <div className={styles.chatbot_input_area}>
        <InputBar
          key={"initialInput"}
          hasError={showInitialInputErrorState}
          badgeText={
            initialInputFocused || inputText.length > 0
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
            value: !open ? inputText : "",
            onChange: (e) => {
              if (!open) setInputText(e.target.value);
            },
            placeholder: conversation.error
              ? "Something went wrong. Try reloading the page and starting a new conversation."
              : awaitingReply
              ? "MongoDB AI is answering..."
              : "Ask MongoDB AI a Question",
          }}
          onMessageSend={async (messageContent) => {
            if (!open && conversation.messages.length > 0) {
              openChat();
              return;
            }
            const canSubmit =
              inputTextError.length === 0 && !conversation.error;
            if (canSubmit) {
              await handleSubmit(messageContent);
            }
          }}
          onClick={async () => {
            if (conversation.messages.length > 0) {
              openChat();
            }
            if (!conversation.conversationId) {
              await conversation.createConversation();
            }
          }}
          onFocus={() => {
            setInitialInputFocused(true);
          }}
          onBlur={() => {
            setInitialInputFocused(false);
          }}
        >
          {showSuggestedPrompts ? (
            <SuggestedPrompts>
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
          {showInitialInputErrorState ? (
            <ErrorText>{inputTextError}</ErrorText>
          ) : null}
          <LegalDisclosure />
        </div>
      </div>
      <ChatbotModal
        awaitingReply={awaitingReply}
        conversation={conversation}
        darkMode={darkMode}
        handleSubmit={handleSubmit}
        inputBarRef={inputBarRef}
        inputText={inputText}
        inputTextError={inputTextError}
        open={open}
        setInputText={setInputText}
        shouldClose={closeChat}
      />
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
