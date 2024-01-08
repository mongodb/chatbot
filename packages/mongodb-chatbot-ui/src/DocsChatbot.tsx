import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./DarkMode";
import { InputBarTrigger, InputBarTriggerProps } from "./InputBarTrigger";
import { ModalView, ModalViewProps } from "./ModalView";

export type DocsChatbotProps = DarkModeProps & {
  suggestedPrompts?: string[];
};

export function DocsChatbot(props: DocsChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const triggerProps = {
    suggestedPrompts: props.suggestedPrompts ?? [],
  } satisfies InputBarTriggerProps;

  const viewProps = {
    darkMode,
  } satisfies ModalViewProps;

  return (
    <>
      <InputBarTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
