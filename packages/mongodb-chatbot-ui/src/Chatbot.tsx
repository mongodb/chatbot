import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { UserProvider } from "./UserProvider";
import { useChatbot, OpenCloseHandlers, UseChatbotProps } from "./useChatbot";
import { LinkDataProvider } from "./LinkDataProvider";
import { type User } from "./useUser";
import { ChatbotProvider } from "./ChatbotProvider";
import ConversationProvider from "./ConversationProvider";
import { RenameFields } from "./utils";

export type ChatbotProps = OpenCloseHandlers &
  RenameFields<UseChatbotProps, { chatbotName: "name" }> & {
    children: React.ReactElement | React.ReactElement[];
    darkMode?: boolean;
    tck?: string;
    user?: User;
  };

export function Chatbot({
  children,
  serverBaseUrl,
  shouldStream,
  user,
  name,
  fetchOptions,
  isExperimental,
  onOpen,
  onClose,
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
    isExperimental,
    maxInputCharacters,
    maxCommentCharacters,
    onOpen,
    onClose,
  });

  const tck = props.tck ?? "mongodb_ai_chatbot";

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <LinkDataProvider tck={tck}>
        <UserProvider user={user}>
          <ChatbotProvider {...chatbotData}>
            <ConversationProvider conversation={chatbotData.conversation}>
              {children}
            </ConversationProvider>
          </ChatbotProvider>
        </UserProvider>
      </LinkDataProvider>
    </LeafyGreenProvider>
  );
}
