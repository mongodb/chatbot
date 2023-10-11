import { css } from "@emotion/css";
import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { palette } from "@leafygreen-ui/palette";
import { Body, Error as ErrorText, Link } from "@leafygreen-ui/typography";
import { useRef, useState } from "react";
import { InputBar, SuggestedPrompt, SuggestedPrompts } from "./InputBar";
import { MAX_INPUT_CHARACTERS } from "./constants";
import { useConversation } from "./useConversation";
import { addQueryParams } from "./utils";
import { ChatbotModal } from "./ChatbotModal";

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
  serverBaseUrl?: string;
  shouldStream?: boolean;
  darkMode?: boolean;
  suggestedPrompts?: string[];
  tck?: string;
};

export function Chatbot(props: ChatbotProps) {
  const conversation = useConversation({
    serverBaseUrl: props.serverBaseUrl,
    shouldStream: props.shouldStream,
  });
  const { darkMode } = useDarkMode(props.darkMode);
  const [modalOpen, setModalOpen] = useState(false);
  const [awaitingReply, setAwaitingReply] = useState(false);
  const inputBarRef = useRef<HTMLFormElement>(null);

  async function openModal() {
    if (modalOpen) {
      return;
    }
    setModalOpen(true);
    if (!conversation.conversationId) {
      await conversation.createConversation();
    }
  }

  function closeModal() {
    setModalOpen(false);
  }

  const [inputData, setInputData] = useState({
    text: "",
    error: "",
  });
  const inputText = inputData.text;
  const inputTextError = inputData.error;
  function setInputText(text: string) {
    const isValid = text.length <= MAX_INPUT_CHARACTERS;
    setInputData({
      text,
      error: isValid
        ? ""
        : `Input must be less than ${MAX_INPUT_CHARACTERS} characters`,
    });
  }

  const handleSubmit = async (text: string) => {
    if (!conversation.conversationId) {
      console.error(`Cannot addMessage without a conversationId`);
      return;
    }
    if (inputData.error) {
      console.error(`Cannot addMessage with invalid input text`);
      return;
    }
    // Don't let users submit a message that is empty or only whitespace
    if (text.replace(/\s/g, "").length === 0) return;
    // Don't let users submit a message if we're already waiting for a reply
    if (awaitingReply) return;
    try {
      setInputText("");
      setAwaitingReply(true);
      openModal();
      await conversation.addMessage("user", text);
    } catch (e) {
      console.error(e);
    } finally {
      setAwaitingReply(false);
    }
  };

  const showSuggestedPrompts =
    (props.suggestedPrompts ?? []).length > 0 &&
    inputText.length === 0 &&
    conversation.messages.length === 0 &&
    !awaitingReply;

  const [initialInputFocused, setInitialInputFocused] = useState(false);
  const showInitialInputErrorState = inputTextError !== "" && !modalOpen;

  const tck = props.tck ?? "docs_chatbot";

  return (
    <LeafyGreenProvider darkMode={darkMode}>
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
                <PoweredByAtlasVectorSearch tck={tck} />
              </div>
            }
            textareaProps={{
              value: !modalOpen ? inputText : "",
              onChange: (e) => {
                if (!modalOpen) setInputText(e.target.value);
              },
              placeholder: conversation.error
                ? "Something went wrong. Try reloading the page and starting a new conversation."
                : awaitingReply
                ? "MongoDB AI is answering..."
                : "Ask MongoDB AI a Question",
            }}
            onMessageSend={async (messageContent) => {
              if (!modalOpen && conversation.messages.length > 0) {
                openModal();
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
                openModal();
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
            <LegalDisclosure tck={tck} />
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
          open={modalOpen}
          shouldClose={() => {
            closeModal();
            return true;
          }}
          darkMode={darkMode}
        />
      </div>
    </LeafyGreenProvider>
  );
}

function LegalDisclosure({ tck = "docs_chatbot" }: LinkProps = {}) {
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

type LinkProps = {
  tck?: string;
};

function PoweredByAtlasVectorSearch({ tck = "docs_chatbot" }: LinkProps = {}) {
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
