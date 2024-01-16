import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./DarkMode";
import { FloatingActionButtonTrigger, type FloatingActionButtonTriggerProps } from "./FloatingActionButtonTrigger";
import { ModalView, ModalViewProps } from "./ModalView";
import { MongoDbLegalDisclosure } from "./MongoDbLegal";
import { mongoDbVerifyInformationMessage } from "./ui-text";


export type DevCenterChatbotProps = DarkModeProps & {
  initialMessageText?: string;
  initialMessageSuggestedPrompts?: string[];
};

export function DevCenterChatbot(props: DevCenterChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const triggerProps = {} satisfies FloatingActionButtonTriggerProps;

  const viewProps = {
    darkMode,
    initialMessageText:
      props.initialMessageText ??
      "Hi! I'm the MongoDB AI. What can I help you with today?",
    initialMessageSuggestedPrompts: props.initialMessageSuggestedPrompts ?? [],
    disclaimer: <MongoDbLegalDisclosure />,
    inputBottomText: mongoDbVerifyInformationMessage,
  } satisfies ModalViewProps;

  return (
    <>
      <FloatingActionButtonTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
