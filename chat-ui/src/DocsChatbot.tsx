import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { ModalView } from "./ModalView";
import { useChatbotContext } from "./useChatbotContext";
import { InputBarTrigger, InputBarTriggerProps } from "./InputBarTrigger";
import { ChatbotViewProps, DarkModeProps } from "./ChatbotView";

export type DocsChatbotProps = DarkModeProps & {
  suggestedPrompts?: string[];
};

export function DocsChatbot(props: DocsChatbotProps) {
  const chatbotData = useChatbotContext();
  const { darkMode } = useDarkMode(props.darkMode);

  const triggerProps = {
    suggestedPrompts: props.suggestedPrompts,
  } satisfies InputBarTriggerProps

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
