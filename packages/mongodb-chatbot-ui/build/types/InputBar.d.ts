import { InputBarProps as LGInputBarProps } from "@lg-chat/input-bar";
export { SuggestedPrompts, SuggestedPrompt } from "@lg-chat/input-bar";
export interface InputBarProps extends LGInputBarProps {
    hasError?: boolean;
}
export declare const InputBar: import("react").ForwardRefExoticComponent<Omit<InputBarProps, "ref"> & import("react").RefAttributes<HTMLFormElement>>;
export interface CharacterCountProps {
    current: number;
    max: number;
    darkMode?: boolean;
    className?: HTMLElement["className"];
}
export declare function CharacterCount({ current, max, darkMode, className, }: CharacterCountProps): import("react/jsx-runtime").JSX.Element;
export declare function MongoDbInputBarPlaceholder(): string;
