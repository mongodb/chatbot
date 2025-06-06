import LeafyGreenProvider, {
  useDarkMode,
} from "@leafygreen-ui/leafygreen-provider";
import { UserProvider } from "./UserProvider";
import { useChatbot, OpenCloseHandlers, UseChatbotProps } from "./useChatbot";
import { LinkDataProvider } from "./LinkDataProvider";
import { type User } from "./useUser";
import { ChatbotProvider } from "./ChatbotProvider";
import { ConversationStateProvider } from "./ConversationStateProvider";
import { RenameFields } from "./utils";
import { HotkeyContextProvider } from "./HotkeyContext";

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
  onOpen,
  onClose,
  sortMessageReferences,
  getClientContext,
  ...props
}: ChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const DEFAULT_MAX_INPUT_CHARACTERS = 3000;
  const maxInputCharacters =
    props.maxInputCharacters ?? DEFAULT_MAX_INPUT_CHARACTERS;

  const DEFAULT_MAX_COMMENT_CHARACTERS = 500;
  const maxCommentCharacters =
    props.maxCommentCharacters ?? DEFAULT_MAX_COMMENT_CHARACTERS;

  const tck = props.tck ?? "mongodb_ai_chatbot";

  return (
    <LeafyGreenProvider darkMode={darkMode}>
      <ConversationStateProvider>
        <LinkDataProvider tck={tck}>
          <UserProvider user={user}>
            <InnerChatbot
              fetchOptions={fetchOptions}
              getClientContext={getClientContext}
              maxCommentCharacters={maxCommentCharacters}
              maxInputCharacters={maxInputCharacters}
              name={name}
              onOpen={onOpen}
              onClose={onClose}
              serverBaseUrl={serverBaseUrl}
              shouldStream={shouldStream}
              sortMessageReferences={sortMessageReferences}
            >
              {children}
            </InnerChatbot>
          </UserProvider>
        </LinkDataProvider>
      </ConversationStateProvider>
    </LeafyGreenProvider>
  );
}

type InnerChatbotProps = Pick<
  ChatbotProps,
  | "children"
  | "fetchOptions"
  | "getClientContext"
  | "maxCommentCharacters"
  | "maxInputCharacters"
  | "name"
  | "onOpen"
  | "onClose"
  | "serverBaseUrl"
  | "shouldStream"
  | "sortMessageReferences"
>;

function InnerChatbot({ children, name, ...props }: InnerChatbotProps) {
  const chatbotData = useChatbot({
    chatbotName: name,
    ...props,
  });

  return (
    <ChatbotProvider {...chatbotData}>
      <HotkeyContextProvider>{children}</HotkeyContextProvider>
    </ChatbotProvider>
  );
}
