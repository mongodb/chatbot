// import { useConversation, Conversation } from "./useConversation";

import { css } from "@emotion/css";
import LeafyGreenProvider from "@leafygreen-ui/leafygreen-provider";
import Modal from "@leafygreen-ui/modal";
import { Body } from "@leafygreen-ui/typography";
import { Avatar } from "@lg-chat/avatar";
import { ChatWindow } from "@lg-chat/chat-window";
import { ChatTrigger } from "@lg-chat/fixed-chat-window";
import { InputBar } from "@lg-chat/input-bar";
import { Message, MessageSourceType } from "@lg-chat/message";
import { MessageFeed } from "@lg-chat/message-feed";
import { MessagePrompt, MessagePrompts } from "@lg-chat/message-prompts";
import { useState } from "react";
import { LeafyGreenChatProvider } from "@lg-chat/leafygreen-chat-provider";
import { DisclaimerText } from "@lg-chat/chat-disclaimer";

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
  chat_window: css`
    border-radius: 24px;
  `,
  chatbot_modal: css`
    z-index: 2;

    & * {
      box-sizing: border-box;
    }

    & div[role="dialog"] {
      padding: 0;
    }

    @media screen and (max-width: 1024px) {
      & div[role="dialog"] {
        width: 100%;
      }
    }
  `,
  disclaimer_text_container: css`
    display: flex;
  `,
  disclaimer_text: css`
    & p {
      text-align: center;
    }
  `,
  chatbot_input: css`
    padding-bottom: 1rem;
    & > p {
      text-align: left;
    }
  `,
};

type ChatbotModalProps = {
  open: boolean;
  shouldClose: () => boolean;
};

// const DisclaimerTextDescription = () => {
//   return (
//     <div className={styles.disclaimer_text}>
//       This is a
//       <Link href={"https://www.mongodb.com/legal/terms-of-use"}>
//         Terms of Use
//       </Link>
//     </div>
//   );
// };

const SampleMarkDown = `
# Heading 1

## Heading 2

### Heading 3

This is a paragraph.

Each paragraph can span multiple lines. And have multiple sentences!

A paragraph can also contain formatted text, like *italics* or **bold** words.

You can link to a URL using markdown link notation, e.g. [LeafyGreen UI](mongodb.design)

If you want to talk about code in a paragraph, you can use \`inline code\`. Wow!

Or you can use a markdown code block like this:

\`\`\`typescript
type HelloWorld = "Hello, world!"

function helloWorld() {
  return "Hello, world!" satisfies HelloWorld;
}
\`\`\`

- [https://mongodb.github.io/leafygreen-ui/?path=/docs/overview-introduction--docs](https://mongodb.github.io/leafygreen-ui/?path=/docs/overview-introduction--docs)
- [https://mongodb.github.io/leafygreen-ui/?path=/docs/overview-introduction--docs](https://mongodb.github.io/leafygreen-ui/?path=/docs/overview-introduction--docs)
- [https://mongodb.github.io/leafygreen-ui/?path=/docs/overview-introduction--docs](https://mongodb.github.io/leafygreen-ui/?path=/docs/overview-introduction--docs)
`;

function ChatbotModal(props: ChatbotModalProps) {
  return (
    <Modal
      open={props.open}
      size="large"
      shouldClose={props.shouldClose}
      className={styles.chatbot_modal}
    >
      <LeafyGreenChatProvider>
        <ChatWindow
          title="MongoDB AI Assistant"
          badgeText="Experimental"
          className={styles.chat_window}
        >
          <MessageFeed>
            {/* <DisclaimerText
            className={styles.disclaimer_text_container}
            title="Terms of Use"
            description={DisclaimerTextDescription()}
          /> */}
            <Message
              baseFontSize={13}
              isSender={false}
              messageRatingProps={{
                description: "How was the response?",
                onChange: (e) => console.log(e),
              }}
              avatar={<Avatar variant="mongo" />}
              sourceType={MessageSourceType.Text}
            >
              Welcome to MongoDB AI Assistant. What can I help you with?
            </Message>
            <MessagePrompts label="Suggested Prompts">
              <MessagePrompt>
                How do you deploy a free cluster in Atlas?
              </MessagePrompt>
              <MessagePrompt>
                How do you deploy a free cluster in Atlas?
              </MessagePrompt>
              <MessagePrompt>
                How do you deploy a free cluster in Atlas?
              </MessagePrompt>
            </MessagePrompts>
            <Message
              isSender={true}
              avatar={<Avatar variant="user" name="S C" />}
              baseFontSize={13}
              sourceType={MessageSourceType.Text}
            >
              How do you deploy a free cluster in Atlas?
            </Message>
            <Message
              baseFontSize={13}
              isSender={false}
              messageRatingProps={{
                description: "How was the response?",
                onChange: (e) => console.log(e),
              }}
              avatar={<Avatar variant="mongo" />}
              sourceType={MessageSourceType.Markdown}
            >
              {SampleMarkDown}
            </Message>
          </MessageFeed>
          <InputBar
            textareaProps={{
              placeholder: "Ask MongoDB AI assistant a question",
            }}
          />
        </ChatWindow>
      </LeafyGreenChatProvider>
    </Modal>
  );
}

export type ChatbotProps = {
  serverBaseUrl?: string;
  shouldStream?: boolean;
  darkMode?: boolean;
  suggestedPrompts?: string[];
};

export function Chatbot(props: ChatbotProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => {
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
  };

  return (
    <LeafyGreenProvider darkMode={props.darkMode}>
      <ChatTrigger
        className={styles.chat_trigger}
        onClick={() => {
          openModal();
        }}
      >
        MongoDB AI
      </ChatTrigger>
      <ChatbotModal
        open={modalOpen}
        shouldClose={() => {
          closeModal();
          return true;
        }}
      />
    </LeafyGreenProvider>
  );
}
