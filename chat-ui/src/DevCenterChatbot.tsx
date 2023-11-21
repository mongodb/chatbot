import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./DarkMode";
import { FloatingActionButtonTrigger } from "./FloatingActionButtonTrigger";
import { ModalView, ModalViewProps } from "./ModalView";
import { SUGGESTED_PROMPTS, WELCOME_MESSAGE } from "./constants";

export type DevCenterChatbotProps = DarkModeProps & {
  initialMessageText?: string;
  initialMessageSuggestedPrompts?: string[];
};

export function DevCenterChatbot(props: DevCenterChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const viewProps = {
    darkMode,
    initialMessageText: props.initialMessageText ?? WELCOME_MESSAGE,
    initialMessageSuggestedPrompts: props.initialMessageSuggestedPrompts ?? SUGGESTED_PROMPTS,
    showDisclaimer: true,
  } satisfies ModalViewProps;

  return (
    <>
      <FloatingActionButtonTrigger />
      <ModalView {...viewProps} />
    </>
  );
}
