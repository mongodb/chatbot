import { css } from "@emotion/css";
import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { palette } from "@leafygreen-ui/palette";
import { Body, Error as ErrorText, Link } from "@leafygreen-ui/typography";
import { useState } from "react";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { addQueryParams } from "./utils";
import { ChatbotModal } from "./ChatbotModal";
import { LinkDataProvider, useLinkData } from "./useLinkData";
import { useChatbot } from "./useChatbot";

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

export type ChatbotProps = {
  darkMode?: boolean;
  initialMessageText?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  tck?: string;
  user?: User;
};

export function Chatbot(props: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const {
    awaitingReply,
    closeChat,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    open,
    openChat,
    setInputText,
  } = useChatbot({
    serverBaseUrl: props.serverBaseUrl,
    shouldStream: props.shouldStream,
  });

  const showSuggestedPrompts =
    (props.suggestedPrompts ?? []).length > 0 &&
    inputText.length === 0 &&
    conversation.messages.length === 0 &&
    !awaitingReply;

  const [initialInputFocused, setInitialInputFocused] = useState(false);
  const showInitialInputErrorState = inputTextError !== "" && !open;

  const tck = props.tck ?? "docs_chatbot";

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <LinkDataProvider tck={tck}>
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
                <SuggestedPrompts label="SUGGESTED AI PROMPTS">
                  {props.suggestedPrompts?.map((suggestedPrompt) => (
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
            inputBarRef={inputBarRef}
            conversation={conversation}
            inputText={inputText}
            setInputText={setInputText}
            inputTextError={inputTextError}
            handleSubmit={handleSubmit}
            awaitingReply={awaitingReply}
            open={open}
            shouldClose={() => {
              closeChat();
              return true;
            }}
            darkMode={darkMode}
          />
        </div>
      </LinkDataProvider>
    </LeafyGreenProvider>
  );
}

function LegalDisclosure() {
  const { tck } = useLinkData();
  const TermsOfUse = () => (
    <Link
      hideExternalIcon
      href={addQueryParams("https://www.mongodb.com/legal/terms-of-use", {
        tck,
      })}
    >
      Terms of Use
    </Link>
  );
  const AcceptableUsePolicy = () => (
    <Link
      hideExternalIcon
      href={addQueryParams(
        "https://www.mongodb.com/legal/acceptable-use-policy",
        { tck }
      )}
    >
      Acceptable Use Policy
    </Link>
  );

  return (
    <Body>
      This is a generative AI chatbot. By interacting with it, you agree to
      MongoDB's <TermsOfUse /> and <AcceptableUsePolicy />.
    </Body>
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
