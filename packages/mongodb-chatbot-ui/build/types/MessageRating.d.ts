import { type MessageRatingProps } from "@lg-chat/message-rating";
export type RatingCommentStatus = "none" | "submitted" | "abandoned";
export type MessageRatingWithFeedbackCommentProps = {
    submit: (commentText: string) => void | Promise<void>;
    abandon: () => void;
    status: RatingCommentStatus;
    errorMessage?: string;
    clearErrorMessage?: () => void;
    maxCommentCharacterCount?: number;
    messageRatingProps: MessageRatingProps;
};
export declare function MessageRatingWithFeedbackComment(props: MessageRatingWithFeedbackCommentProps): import("react/jsx-runtime").JSX.Element;
export declare function InlineMessageFeedbackErrorState({ errorMessage, }: {
    errorMessage: string;
}): import("react/jsx-runtime").JSX.Element;
