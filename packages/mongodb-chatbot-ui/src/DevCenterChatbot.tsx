import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";
import { DarkModeProps } from "./DarkMode";
import {
  FloatingActionButtonTrigger,
  type FloatingActionButtonTriggerProps,
} from "./FloatingActionButtonTrigger";
import { ModalView, ModalViewProps } from "./ModalView";
import { MongoDbLegalDisclosure } from "./MongoDbLegal";
import { mongoDbVerifyInformationMessage } from "./ui-text";
import { PoweredByAtlasVectorSearch } from "./PoweredByAtlasVectorSearch";
import { css } from "@emotion/css";
import { References } from "mongodb-rag-core";

export type DevCenterChatbotProps = DarkModeProps & {
  initialMessageText?: string;
  initialMessageSuggestedPrompts?: string[];
  initialMessageReferences?: References;
};

export function DevCenterChatbot(props: DevCenterChatbotProps) {
  const { darkMode } = useDarkMode(props.darkMode);

  const triggerProps = {} satisfies FloatingActionButtonTriggerProps;

  const viewProps = {
    darkMode,
    initialMessageText:
      props.initialMessageText ??
      "Hi! I'm the MongoDB AI. What can I help you with today?",
    initialMessageReferences: props.initialMessageReferences,
    initialMessageSuggestedPrompts: props.initialMessageSuggestedPrompts ?? [],
    disclaimer: (
      <>
        <MongoDbLegalDisclosure />
        <PoweredByAtlasVectorSearch
          className={css`
            margin-top: 8px;
          `}
          linkStyle="text"
        />
      </>
    ),
    shouldRenderHotkeyIndicator: true,
    inputBottomText: mongoDbVerifyInformationMessage,
  } satisfies ModalViewProps;

  return (
    <>
      <FloatingActionButtonTrigger {...triggerProps} />
      <ModalView {...viewProps} />
    </>
  );
}
