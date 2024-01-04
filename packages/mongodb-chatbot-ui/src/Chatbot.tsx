import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { UserProvider } from "./UserProvider";
import { useChatbot } from "./useChatbot";
import { LinkDataProvider } from "./LinkDataProvider";
import { type User } from "./useUser";
import { ChatbotProvider } from "./ChatbotProvider";

export type ChatbotProps = {
  darkMode?: boolean;
  tck?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  user?: User;
  children: React.ReactElement | React.ReactElement[];
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

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <LinkDataProvider tck={tck}>
        <UserProvider user={user}>
          <ChatbotProvider {...chatbotData}>{children}</ChatbotProvider>
        </UserProvider>
      </LinkDataProvider>
    </LeafyGreenProvider>
  );
}
