import { type ChatbotTextInputTriggerProps } from "./useTextInputTrigger";
export type InputBarTriggerProps = ChatbotTextInputTriggerProps & {
    bottomContent?: React.ReactNode;
    suggestedPrompts?: string[];
};
export declare function InputBarTrigger({ className, suggestedPrompts, bottomContent, fatalErrorMessage, placeholder, darkMode: darkModeProp, }: InputBarTriggerProps): import("react/jsx-runtime").JSX.Element;
