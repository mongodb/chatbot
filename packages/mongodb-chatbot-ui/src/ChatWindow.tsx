import { css, cx } from "@emotion/css";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { Body, InlineCode } from "@leafygreen-ui/typography";
import { ChatWindow as LGChatWindow } from "@lg-chat/chat-window";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { Suspense, useMemo } from "react";
import { ErrorBanner } from "./Banner";
import {
  CharacterCount,
  InputBar,
  MongoDbInputBarPlaceholder,
} from "./InputBar";
import { defaultChatbotFatalErrorMessage } from "./ui-text";
import { Conversation } from "./useConversation";
import { type ChatbotViewProps } from "./ChatbotView";
import { useChatbotContext } from "./useChatbotContext";
import { useHotkeyContext } from "./HotkeyContext";
import { ChatMessageFeed } from "./ChatMessageFeed";
import { MessageData } from "./services/conversations";
import { DarkModeProps } from "./DarkMode";

export type ChatWindowProps = ChatbotViewProps;

export function ChatWindow(props: ChatWindowProps) {
  const { darkMode } = useDarkMode(props.darkMode);
  const {
    className,
    disclaimer,
    disclaimerHeading,
    fatalErrorMessage,
    initialMessageText,
    initialMessageReferences,
    initialMessageSuggestedPrompts,
    inputBarId = "chatbot-input-bar",
    inputBottomText,
    windowTitle,
  } = props;

  const { chatbotName, isExperimental } = useChatbotContext();

  const initialMessage: MessageData | null = useMemo(() => {
    if (!initialMessageText) {
      return null;
    }
    const data: MessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: initialMessageText,
      createdAt: new Date().toLocaleTimeString(),
      suggestedPrompts: initialMessageSuggestedPrompts,
      references: initialMessageReferences,
    };
    return data;
  }, [
    initialMessageText,
    initialMessageReferences,
    initialMessageSuggestedPrompts,
  ]);

  return (
    <LeafyGreenChatProvider>
      <LGChatWindow
        className={cx(css`border-radius: 24px;`, className)}
        badgeText={isExperimental ? "Experimental" : undefined}
        title={windowTitle ?? chatbotName ?? ""}
        darkMode={darkMode}
      >
        <Suspense fallback={null}>
          <ChatMessageFeed
            darkMode={darkMode}
            disclaimer={disclaimer}
            disclaimerHeading={disclaimerHeading}
            initialMessage={initialMessage}
          />
        </Suspense>
        <ChatInput
          id={inputBarId}
          fatalErrorMessage={fatalErrorMessage}
          darkMode={darkMode}
          bottomText={inputBottomText}
          placeholder={props.inputBarPlaceholder}
        />
      </LGChatWindow>
    </LeafyGreenChatProvider>
  );
}

type ChatInputProps = DarkModeProps & {
  fatalErrorMessage?: ChatWindowProps["fatalErrorMessage"];
  id?: ChatWindowProps["inputBarId"];
  bottomText?: ChatWindowProps["inputBottomText"];
  placeholder?: ChatWindowProps["inputBarPlaceholder"];
};

function ChatInput({
  darkMode: darkModeProp,
  fatalErrorMessage = defaultChatbotFatalErrorMessage,
  id = "chatbot-input-bar",
  bottomText,
  placeholder = MongoDbInputBarPlaceholder(),
}: ChatInputProps) {
  const { darkMode } = useDarkMode(darkModeProp);
  const {
    awaitingReply,
    conversation,
    handleSubmit,
    inputBarRef,
    inputText,
    inputTextError,
    maxInputCharacters,
    setInputText,
  } = useChatbotContext();

  const hasError = inputTextError !== "";

  const hotkeyContext = useHotkeyContext();

  return (
    <div
      className={css`
        position: relative;
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
        padding-left: 32px;
        padding-right: 32px;
        padding-top: 0.5rem;
        padding-bottom: 1rem;
      `}
    >
      {conversation.error ? (
        <ErrorBanner darkMode={darkMode} message={conversation.error} />
      ) : (
        <>
          <InputBar
            hasError={hasError}
            shouldRenderGradient={!inputTextError}
            darkMode={darkMode}
            ref={inputBarRef}
            disabled={Boolean(conversation.error?.length)}
            disableSend={hasError || awaitingReply}
            shouldRenderHotkeyIndicator={hotkeyContext.hotkey !== null}
            onMessageSend={(messageContent) => {
              const canSubmit =
                inputTextError.length === 0 && !conversation.error;
              if (canSubmit) {
                handleSubmit(messageContent);
              }
            }}
            textareaProps={{
              id,
              value: inputText,
              onChange: (e) => {
                setInputText(e.target.value);
              },
              placeholder: conversation.error ? fatalErrorMessage : placeholder,
            }}
          />

          <div
            className={css`
              display: flex;
              justify-content: space-between;
            `}
          >
            {bottomText ? (
              <Body
                baseFontSize={13}
                className={css`
                  text-align: center;
                `}
              >
                {bottomText}
              </Body>
            ) : null}
            {maxInputCharacters ? (
              <CharacterCount
                darkMode={darkMode}
                current={inputText.length}
                max={maxInputCharacters}
              />
            ) : null}
          </div>
        </>
      )}

      <ConversationId conversation={conversation} />
    </div>
  );
}

function ConversationId({ conversation }: { conversation: Conversation }) {
  return import.meta.env.VITE_QA === "true" ? (
    <div
      className={css`
      display: flex;
      flex-direction: row;
      justify-content: center;
    `}
    >
      <Body>
        Conversation ID: <InlineCode>{conversation.conversationId}</InlineCode>
      </Body>
    </div>
  ) : null;
}
