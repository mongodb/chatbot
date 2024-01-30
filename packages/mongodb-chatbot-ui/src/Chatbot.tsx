import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { UserProvider } from "./UserProvider";
import { useChatbot } from "./useChatbot";
import { LinkDataProvider } from "./LinkDataProvider";
import { type User } from "./useUser";
import { ChatbotProvider } from "./ChatbotProvider";
import { ConversationFetchOptions } from "./services/conversations";

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
  fetchOptions?: ConversationFetchOptions;
};

export function Chatbot({
  children,
  serverBaseUrl,
  shouldStream,
  user,
  name,
  fetchOptions,
  ...props
}: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const DEFAULT_MAX_INPUT_CHARACTERS = 300;
  const maxInputCharacters =
    props.maxInputCharacters ?? DEFAULT_MAX_INPUT_CHARACTERS;

  const chatbotData = useChatbot({
    chatbotName: name,
    serverBaseUrl,
    shouldStream,
    maxInputCharacters: maxInputCharacters,
    fetchOptions,
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
