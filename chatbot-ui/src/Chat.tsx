import Banner from "@leafygreen-ui/banner";
import { ChatInput } from "./TextInput";
import { Message, MessageData } from "./Message";

import styles from "./Chat.module.css";

export function Chat({ messages, addMessage }: { messages: MessageData[], addMessage: (message: MessageData) => void }) {
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
      <ChatInput onSubmit={(message) => addMessage(message.text)} />
    </div>
  );
}
