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
  maxCommentCharacters?: number;
  name?: string;
  serverBaseUrl?: string;
  shouldStream?: boolean;
  tck?: string;
  user?: User;
  fetchOptions?: ConversationFetchOptions;
  open?: boolean;
  closeChatOverride?: () => boolean;
};

export function Chatbot({
  children,
  serverBaseUrl,
  shouldStream,
  user,
  name,
  fetchOptions,
  open,
  closeChatOverride,
  ...props
}: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const DEFAULT_MAX_INPUT_CHARACTERS = 300;
  const maxInputCharacters =
    props.maxInputCharacters ?? DEFAULT_MAX_INPUT_CHARACTERS;

  const DEFAULT_MAX_COMMENT_CHARACTERS = 500;
  const maxCommentCharacters =
    props.maxCommentCharacters ?? DEFAULT_MAX_COMMENT_CHARACTERS;

  const chatbotData = useChatbot({
    chatbotName: name,
    serverBaseUrl,
    shouldStream,
    fetchOptions,
    maxInputCharacters,
    maxCommentCharacters,
    closeChatOverride,
  });

  const { openChat } = chatbotData;

  if (open) {
    openChat();
  }

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
