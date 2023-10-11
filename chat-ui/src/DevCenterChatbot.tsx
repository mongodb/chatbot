import { css } from "@emotion/css";

import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { useEffect, useRef, useState } from "react";
import { UserProvider } from "./UserProvider";
import { MessageData } from "./services/conversations";
import { useConversation } from "./useConversation";
import { User } from "./useUser";
import { ChatbotModal } from "./ChatbotModal";

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
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  startingMessage?: string;
  user?: User;
};

export function Chatbot(props: ChatbotProps) {
  const { user, darkMode: propsDarkMode, ...innerChatbotProps } = props;
  const { darkMode } = useDarkMode(propsDarkMode);

  // TODO: Use ConversationProvider
  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <UserProvider user={user}>
        <InnerChatbot {...innerChatbotProps} />
      </UserProvider>
    </LeafyGreenProvider>
  );
}

type InnerChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  welcomeMessage?: string;
};

const WELCOME_MESSAGE =
  "Welcome to MongoDB AI Assistant. What can I help you with?";

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
  welcomeMessage = WELCOME_MESSAGE,
}: InnerChatbotProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [welcomeMessageData, setWelcomeMessageData] =
    useState<MessageData | undefined>();
  const [inputBarValue, setInputBarValue] = useState("");

  const conversation = useConversation({
    serverBaseUrl: serverBaseUrl,
    shouldStream: shouldStream,
  });

  useEffect(() => {
    if (!conversation.conversationId || welcomeMessageData) return;

    const newWelcomeMessageData = {
      id: crypto.randomUUID(),
      role: "assistant",
      content: welcomeMessage,
      createdAt: new Date().toLocaleTimeString(),
    } satisfies MessageData;

    setWelcomeMessageData(newWelcomeMessageData);
  }, [conversation.conversationId, welcomeMessageData, welcomeMessage]);

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
        initialMessage={welcomeMessageData}
        conversation={conversation}
        inputText={inputBarValue}
        setInputText={setInputBarValue}
        inputTextError={""}
        handleSubmit={async () => {
          return;
        }}
        awaitingReply
      />
    </>
  );
}
