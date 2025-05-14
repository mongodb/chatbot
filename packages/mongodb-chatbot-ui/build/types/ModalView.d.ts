import { ModalProps } from "@leafygreen-ui/modal";
import { type ChatbotViewProps } from "./ChatbotView";
export type ModalViewProps = ChatbotViewProps & {
    shouldClose?: ModalProps["shouldClose"];
};
export declare function ModalView(props: ModalViewProps): import("react/jsx-runtime").JSX.Element;
