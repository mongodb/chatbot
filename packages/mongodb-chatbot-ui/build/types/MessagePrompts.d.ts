export type MessagePromptsProps = {
    prompts: string[];
    onPromptClick: (prompt: string) => void;
    canSubmit: (prompt: string) => boolean;
};
export declare const MessagePrompts: ({ prompts, onPromptClick, canSubmit, }: MessagePromptsProps) => import("react/jsx-runtime").JSX.Element;
