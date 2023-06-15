import { useEffect, useRef } from "react";
import Icon from "@leafygreen-ui/icon";
import IconButton from "@leafygreen-ui/icon-button";
import { Description } from "@leafygreen-ui/typography";
import styles from "./Message.module.css";
import { Conversation } from "./useConversation";
import LGMarkdown from "./LGMarkdown";
import { MessageData, Role } from "./services/conversations";
import { GeneralContentUserIcon, MongoDBLogoIcon } from "./CustomIcon";



export function Avatar({ role }: { role: Role }) {
  switch (role) {
    case "user":
      return (
        <div
          className={`${styles.message_avatar} ${styles.message_avatar_user}`}
        >
          <div className={styles.message_avatar_icon_container}>
            <GeneralContentUserIcon className={styles.message_avatar_icon} />
          </div>
        </div>
      );
    case "assistant":
      return (
        <div
          className={`${styles.message_avatar} ${styles.message_avatar_assistant}`}
        >
          <div className={styles.message_avatar_icon_container}>
            <MongoDBLogoIcon className={styles.message_avatar_icon} />
          </div>
        </div>
      );
    case "system":
      return (
        <div
          className={`${styles.message_avatar} ${styles.message_avatar_system}`}
        >
          <Icon
            className={styles.message_avatar_icon}
            glyph="Settings"
            color="#000000"
          />
        </div>
      );
  }
}

type MessageRatingProps = {
  messageId: string;
  rateMessage: Conversation["rateMessage"];
  value?: boolean;
};

export function MessageRating(props: MessageRatingProps) {
  return (
    <div className={styles.message_rating}>
      <Description>Rate this response:</Description>
      <IconButton
        aria-label="Thumbs up this message"
        active={props.value === true}
        onClick={() => props.rateMessage(props.messageId, true)}
      >
        <Icon className={styles.message_rating_icon} glyph="ArrowUp" />
      </IconButton>
      <IconButton
        aria-label="Thumbs down this message"
        active={props.value === false}
        onClick={() => props.rateMessage(props.messageId, false)}
      >
        <Icon className={styles.message_rating_icon} glyph="ArrowDown" />
      </IconButton>
    </div>
  );
}

export type MessageProps = {
  message: MessageData;
  rateMessage: Conversation["rateMessage"];
};

export default function Message(props: MessageProps) {
  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, []);
  return (
    <div className={styles.message} ref={messageRef}>
      <Avatar role={props.message.role} />
      <div className={styles.message_text}>
        <LGMarkdown>{props.message.content}</LGMarkdown>
        {props.message.role === "assistant" && (
          <MessageRating
            messageId={props.message.id}
            rateMessage={props.rateMessage}
            value={props.message.rating}
          />
        )}
      </div>
    </div>
  );
}
