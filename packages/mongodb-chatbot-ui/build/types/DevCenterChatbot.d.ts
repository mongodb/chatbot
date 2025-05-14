import { DarkModeProps } from "./DarkMode";
import { References } from "./references";
export type DevCenterChatbotProps = DarkModeProps & {
    initialMessageText?: string;
    initialMessageSuggestedPrompts?: string[];
    initialMessageReferences?: References;
};
export declare function DevCenterChatbot(props: DevCenterChatbotProps): import("react/jsx-runtime").JSX.Element;
