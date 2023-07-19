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
    // TODO: i think this can be removed b/c we never expose the system prompt
    // to the user
    // case "system":
    //   return (
    //     <div
    //       className={`${styles.message_avatar} ${styles.message_avatar_system}`}
    //     >
    //       <Icon
    //         className={styles.message_avatar_icon}
    //         // glyph="Settings"
    //         glyph="Megaphone"
    //         color="#ffffff"
    //       />
    //     </div>
    //   );
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

type ComponentMessageProps = {
  role: Role;
  children: React.ReactNode;
};

type DataMessageProps = {
  message: MessageData;
  rateMessage: Conversation["rateMessage"];
  hideRating?: boolean;
};

export type MessageProps = DataMessageProps | ComponentMessageProps;

export default function Message(props: MessageProps) {
  const isComponentMessage = "children" in props;

  const messageText = isComponentMessage ? null : props.message.content;

  const messageRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messageRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "nearest",
    });
  }, [messageText]);

  const role = isComponentMessage ? props.role : props.message.role;

  return (
    <div className={styles.message} ref={messageRef}>
      <Avatar role={role} />
      {isComponentMessage ? (
        <div className={styles.message_text}>{props.children}</div>
      ) : (
        <div className={styles.message_text}>
          <LGMarkdown>{props.message.content}</LGMarkdown>
          {!props.hideRating && props.message.role === "assistant" && (
            <MessageRating
              messageId={props.message.id}
              rateMessage={props.rateMessage}
              value={props.message.rating}
            />
          )}
        </div>
      )}
    </div>
  );
}
