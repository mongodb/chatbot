import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { UserProvider } from "./UserProvider";
import { useChatbot } from "./useChatbot";
import { LinkDataProvider } from "./LinkDataProvider";
import { type User } from "./useUser";
import { ChatbotProvider } from "./ChatbotProvider";

export type ChatbotProps = {
  children: React.ReactElement | React.ReactElement[];
  darkMode?: boolean;
  isExperimental?: boolean;
  maxInputCharacters?: number;
  name?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  tck?: string;
  user?: User;
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

  // The server currently enforces a max of 300 input characters, so we'll enforce that here too
  const maxInputCharacters = props.maxInputCharacters ?? 300;

  if (maxInputCharacters > 300) {
    console.warn(
      `maxInputCharacters is capped at 300 characters by the chat server. The chatbot UI is currently configured to allow ${props.maxInputCharacters} characters.`
    );
  }

  const chatbotData = useChatbot({
    chatbotName: name,
    serverBaseUrl,
    shouldStream,
    maxInputCharacters: maxInputCharacters,
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
