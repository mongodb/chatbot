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
  initialMessageText?: string;
  suggestedPrompts?: string[];
  tck?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  user?: User;
  children: React.ReactElement;
  apiCredentials: {
    "atlas-admin-api": {
      publicApiKey: string;
      privateApiKey: string;
      organizationId: string;
      projectId: string;
      clusterId: string;
    };
  };
};

export function Chatbot({
  children,
  serverBaseUrl,
  shouldStream,
  user,
  apiCredentials,
  ...props
}: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const chatbotData = useChatbot({
    serverBaseUrl,
    shouldStream,
    apiCredentials,
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
