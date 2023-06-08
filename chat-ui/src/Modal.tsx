import Card from "@leafygreen-ui/card";
import Badge from "@leafygreen-ui/badge";
import { H3 } from "@leafygreen-ui/typography";

import { Chat } from "./Chat";
import useConversation from "./useConversation";

import styles from "./Modal.module.css";

export default function ChatbotModal() {
  const conversation = useConversation();
  return (
    <Card className={styles.modal}>
      <div className={styles.modal_title}>
        <H3>MongoDB AI</H3>
        <Badge variant="green">Experimental</Badge>
      </div>
      <Chat messages={conversation.messages} addMessage={conversation.addMessage}/>
    </Card>
  );
}
