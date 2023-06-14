import Card from "@leafygreen-ui/card";
import Badge from "@leafygreen-ui/badge";
import { H3, Overline } from "@leafygreen-ui/typography";

import Chat from "./Chat";
import useConversation, { ConversationPayload } from "./useConversation";

import styles from "./Modal.module.css";
import SuggestedPrompts from "./SuggestedPrompts";

type EmptyConversationProps = {
  addMessage: ConversationPayload["addMessage"];
  showSuggestedPrompts: boolean;
  showExperimentalBanner: boolean;
};

export function EmptyConversation(props: EmptyConversationProps) {
  return (
    <div className={styles.modal_empty}>
      {props.showSuggestedPrompts ? (
        <SuggestedPrompts
          onPromptSelected={(text) => props.addMessage("user", text)}
        />
      ) : null}
      {props.showExperimentalBanner ? (
        <div className={styles.modal_basic_banner}>
          <Overline>ASK MONGODB AI</Overline>
          <Badge variant="blue">Experimental</Badge>
        </div>
      ) : null}
    </div>
  );
}

type ConversationWithMessagesProps = ConversationPayload & {
  inputText: string;
  setInputText: React.Dispatch<React.SetStateAction<string>>;
};

export function ConversationWithMessages({
  messages,
  rateMessage,
  inputText,
  setInputText,
}: ConversationWithMessagesProps) {
  return (
    <>
      <div className={styles.modal_title}>
        <H3>MongoDB AI</H3>
        <Badge variant="green">Experimental</Badge>
      </div>
      <Chat
        messages={messages}
        rateMessage={rateMessage}
        inputText={inputText}
        setInputText={setInputText}
      />
    </>
  );
}

export default function ChatbotModalContent({
  conversation,
}: {
  conversation: ConversationPayload;
}) {
  return conversation.messages.length === 0 ? (
    <EmptyConversation {...conversation} />
  ) : (
    <ConversationWithMessages {...conversation} />
  );
}

export function ChatbotModalCard() {
  const conversation = useConversation();
  return (
    <Card className={styles.modal}>
      <ChatbotModalContent conversation={conversation} />
    </Card>
  );
}
