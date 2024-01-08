import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./DarkMode";
import { FloatingActionButtonTrigger } from "./FloatingActionButtonTrigger";
import { ModalView, ModalViewProps } from "./ModalView";

export type DevCenterChatbotProps = DarkModeProps & {
  initialMessageText?: string;
  initialMessageSuggestedPrompts?: string[];
};

export function DevCenterChatbot(props: DevCenterChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const viewProps = {
    darkMode,
    initialMessageText:
      props.initialMessageText ??
      "Welcome to MongoDB AI Assistant. What can I help you with?",
    initialMessageSuggestedPrompts:
      props.initialMessageSuggestedPrompts ?? [],
    showDisclaimer: true,
  } satisfies ModalViewProps;

  return (
    <>
      <FloatingActionButtonTrigger />
      <ModalView {...viewProps} />
    </>
  );
}
