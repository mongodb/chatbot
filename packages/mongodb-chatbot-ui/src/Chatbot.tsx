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
  name?: string;
  tck?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  user?: User;
  maxInputCharacters?: number;
  children: React.ReactElement | React.ReactElement[];
};

export function Chatbot({
  children,
  serverBaseUrl,
  shouldStream,
  user,
  name,
  ...props
}: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  if (
    props.maxInputCharacters !== undefined &&
    props.maxInputCharacters > 300
  ) {
    console.warn(
      `maxInputCharacters is capped at 300 characters by the chat server. The chatbot UI is configured to allow ${props.maxInputCharacters}.`
    );
  }

  const chatbotData = useChatbot({
    chatbotName: name,
    serverBaseUrl,
    shouldStream,
    maxInputCharacters: props.maxInputCharacters ?? 300, // The server currently enforces a max of 300, so reflect that here
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
