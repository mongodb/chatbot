import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ChatbotTriggerProps } from "./ChatbotTrigger";
import { ChatbotViewProps } from "./ChatbotView";
import { FloatingActionButtonTrigger } from "./FloatingActionButtonTrigger";
import { ModalView } from "./ModalView";
import { SUGGESTED_PROMPTS, WELCOME_MESSAGE } from "./constants";
import { useChatbotContext } from "./useChatbotContext";

export function DevCenterChatbot() {
  const chatbotData = useChatbotContext();
  const { darkMode } = useDarkMode(chatbotData.darkMode);

  const triggerProps = {
    openChat: chatbotData.openChat,
    closeChat: chatbotData.closeChat,
  } satisfies ChatbotTriggerProps;


  const viewProps = {
    ...chatbotData,
    darkMode,
    initialMessageText: chatbotData.initialMessageText ?? WELCOME_MESSAGE,
    initialMessageSuggestedPrompts: chatbotData.suggestedPrompts ?? SUGGESTED_PROMPTS,
    showDisclaimer: true,
    shouldClose: chatbotData.closeChat,
  } satisfies ChatbotViewProps;

  return (
    <>
      <FloatingActionButtonTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
