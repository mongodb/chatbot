import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./ChatbotView";
import { FloatingActionButtonTrigger } from "./FloatingActionButtonTrigger";
import { ModalView, ModalViewProps } from "./ModalView";
import { SUGGESTED_PROMPTS, WELCOME_MESSAGE } from "./constants";
import { useChatbotContext } from "./useChatbotContext";

export type DevCenterChatbotProps = DarkModeProps & {
  initialMessageText?: string;
  initialMessageSuggestedPrompts?: string[];
};

export function DevCenterChatbot(props: DevCenterChatbotProps) {
  const chatbotData = useChatbotContext();
  const { darkMode } = useDarkMode(props.darkMode);

  const viewProps = {
    darkMode,
    initialMessageText: props.initialMessageText ?? WELCOME_MESSAGE,
    initialMessageSuggestedPrompts: props.initialMessageSuggestedPrompts ?? SUGGESTED_PROMPTS,
    showDisclaimer: true,
    shouldClose: chatbotData.closeChat,
  } satisfies ModalViewProps;

  return (
    <>
      <FloatingActionButtonTrigger />
      <ModalView {...viewProps} />
    </>
  );
}
