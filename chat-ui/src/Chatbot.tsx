import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { DocsChatbot } from "./DocsChatbot";
import { UserProvider } from "./UserProvider";
import { ChatbotData, useChatbot } from "./useChatbot";
import { LinkDataProvider } from "./useLinkData";
import { type User } from "./useUser";
import { cloneElement, isValidElement } from "react";

export type ChatbotProps = {
  darkMode?: boolean;
  initialMessageText?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  tck?: string;
  user?: User;
  children: React.ReactElement<InnerChatbotProps>;
};

export type InnerChatbotProps = Omit<
  ChatbotProps,
  "children" | "serverBaseUrl" | "shouldStream" | "user"
> &
  ChatbotData;

export function Chatbot({
  children,
  serverBaseUrl,
  shouldStream,
  user,
  ...props
}: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const chatbotData = useChatbot({
    serverBaseUrl,
    shouldStream,
  });

  const tck = props.tck ?? "mongodb_ai_chatbot";

  const innerChatbotProps = {
    ...props,
    darkMode,
    ...chatbotData,
  } satisfies InnerChatbotProps;

  // Clone the child element with the correct props
  if (!isValidElement(children)) {
    throw new Error("Expected 'children' to be a single React element.");
  }
  const view = cloneElement(children, innerChatbotProps);

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <LinkDataProvider tck={tck}>
        <UserProvider user={user}>{view}</UserProvider>
      </LinkDataProvider>
    </LeafyGreenProvider>
  );
}
