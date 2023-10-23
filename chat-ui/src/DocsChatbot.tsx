import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./ChatbotView";
import { InputBarTrigger, InputBarTriggerProps } from "./InputBarTrigger";
import { ModalView, ModalViewProps } from "./ModalView";
import { SUGGESTED_PROMPTS } from "./constants";
import { useChatbotContext } from "./useChatbotContext";

export type DocsChatbotProps = DarkModeProps & {
  suggestedPrompts?: string[];
};

export function DocsChatbot(props: DocsChatbotProps) {
  const chatbotData = useChatbotContext();
  const { darkMode } = useDarkMode(props.darkMode);

  const triggerProps = {
    suggestedPrompts: props.suggestedPrompts ?? SUGGESTED_PROMPTS,
  } satisfies InputBarTriggerProps;

  const viewProps = {
    darkMode,
    shouldClose: chatbotData.closeChat,
  } satisfies ModalViewProps;

  return (
    <>
      <InputBarTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
