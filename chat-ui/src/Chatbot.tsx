import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { UserProvider } from "./UserProvider";
import { useChatbot } from "./useChatbot";
import { LinkDataProvider } from "./LinkDataProvider";
import { type User } from "./useUser";
import {
  PolymorphicChatbotData,
  PolymorphicChatbotProvider,
} from "./PolymorphicChatbotProvider";

export type ChatbotProps = {
  darkMode?: boolean;
  initialMessageText?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  suggestedPrompts?: string[];
  tck?: string;
  user?: User;
  children: React.ReactElement;
};



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

  const polymorphicChatbotData = {
    ...props,
    darkMode,
    ...chatbotData,
  } satisfies PolymorphicChatbotData;

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <LinkDataProvider tck={tck}>
        <UserProvider user={user}>
          <PolymorphicChatbotProvider {...polymorphicChatbotData}>
            {children}
          </PolymorphicChatbotProvider>
        </UserProvider>
      </LinkDataProvider>
    </LeafyGreenProvider>
  );
}
