import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./DarkMode";
import { InputBarTrigger, InputBarTriggerProps } from "./InputBarTrigger";
import { ModalView, ModalViewProps } from "./ModalView";
import { MongoDbLegalDisclosure, MongoDbVerifyInformationMessage } from "./MongoDbLegal";

export type DocsChatbotProps = DarkModeProps & {
  suggestedPrompts?: string[];
};

export function DocsChatbot(props: DocsChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const triggerProps = {
    suggestedPrompts: props.suggestedPrompts ?? [],
    bottomContent: <MongoDbLegalDisclosure />,
  } satisfies InputBarTriggerProps;

  const viewProps = {
    darkMode,
    inputBottomText: MongoDbVerifyInformationMessage,
  } satisfies ModalViewProps;

  return (
    <>
      <InputBarTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
