import Banner from "@leafygreen-ui/banner";
import { ChatInput } from "./TextInput";
import { Message, MessageData, SenderType } from "./Message";

import styles from "./Chat.module.css";

export function Chat({
  messages,
  addMessage,
}: {
  messages: MessageData[];
  addMessage: (sender: SenderType, text: string) => void;
}) {
  return (
    <div className={styles.chat}>
      <div className={styles.message_list}>
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
      </div>
      <Banner variant="warning">
        This is an experimental AI chatbot. All information should be verified
        prior to use.
      </Banner>
      <ChatInput
        handleSend={(text: string) => {
          addMessage("user", text);
        }}
      />
    </div>
  );
}
