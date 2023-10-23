import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ModalView } from "./ModalView";
import { useChatbotContext } from "./useChatbotContext";
import { InputBarTrigger } from "./InputBarTrigger";
import { ChatbotTriggerProps } from "./ChatbotTrigger";
import { ChatbotViewProps } from "./ChatbotView";

export function DocsChatbot() {
  const chatbotData = useChatbotContext();
  const { darkMode } = useDarkMode(chatbotData.darkMode);

  const triggerProps = {
    ...chatbotData,
  } satisfies ChatbotTriggerProps;

  const viewProps = {
    ...chatbotData,
    darkMode,
    showDisclaimer: false,
    shouldClose: chatbotData.closeChat,
  } satisfies ChatbotViewProps;

  return (
    <>
      <InputBarTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
