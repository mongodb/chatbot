import { css } from "@emotion/css";
import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChatbotModal } from "./ChatbotModal";
import { UserProvider } from "./UserProvider";
import { MessageData } from "./services/conversations";
import { useConversation } from "./useConversation";
import { User } from "./useUser";
import { MAX_INPUT_CHARACTERS } from "./constants";
import { LinkDataProvider } from "./useLinkData";

const styles = {
  chat_trigger: css`
    position: fixed;
    bottom: 24px;
    right: 24px;

    @media screen and (min-width: 768px) {
      bottom: 32px;
      right: 24px;
    }
    @media screen and (min-width: 1024px) {
      bottom: 32px;
      right: 49px;
    }
  `,
};

export type ChatbotProps = {
  darkMode?: boolean;
  initialMessageText?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  user?: User;
  tck?: string;
};

export function Chatbot(props: ChatbotProps) {
  const { user, darkMode: propsDarkMode, ...innerChatbotProps } = props;
  const { darkMode } = useDarkMode(propsDarkMode);

  const tck = props.tck ?? "devcenter_chatbot";

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <LinkDataProvider tck={tck}>
        <UserProvider user={user}>
          <InnerChatbot {...innerChatbotProps} />
        </UserProvider>
      </LinkDataProvider>
    </LeafyGreenProvider>
  );
}

type InnerChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  initialMessageText?: string;
};

const WELCOME_MESSAGE =
  "Welcome to MongoDB AI Assistant. What can I help you with?";

// TODO - get these from props
const SUGGESTED_PROMPTS = [
  "How do you deploy a free cluster in Atlas?",
  "How do you import or migrate data into MongoDB Atlas?",
  "How do I get started with MongoDB?",
  "Why should I use Atlas Search?",
];

function InnerChatbot({
  serverBaseUrl,
  shouldStream,
  suggestedPrompts = SUGGESTED_PROMPTS,
  initialMessageText = WELCOME_MESSAGE,
}: InnerChatbotProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [inputBarValue, setInputBarValue] = useState("");

  const conversation = useConversation({
    serverBaseUrl: serverBaseUrl,
    shouldStream: shouldStream,
  });

  const initialMessage = useMemo(() => {
    const data: MessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: initialMessageText,
      createdAt: new Date().toLocaleTimeString(),
    };
    return data
  }, [initialMessageText])

  const openModal = async () => {
    if (modalOpen) return;

    if (!conversation.conversationId) {
      await conversation.createConversation();
    }

    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

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

  const inputBarRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <ChatTrigger
        className={styles.chat_trigger}
        onClick={async () => await openModal()}
      >
        MongoDB AI
      </ChatTrigger>
      <ChatbotModal
        open={modalOpen}
        shouldClose={() => {
          closeModal();
          return true;
        }}
        inputBarRef={inputBarRef}
        suggestedPrompts={suggestedPrompts}
        initialMessage={initialMessage}
        conversation={conversation}
        inputText={inputText}
        setInputText={setInputText}
        inputTextError={inputTextError}
        handleSubmit={async () => {
          return;
        }}
        awaitingReply
      />
    </>
  );
}
