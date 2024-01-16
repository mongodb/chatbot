import { css } from "@emotion/css";
import classNames from "classnames";
import {
  ActionButtonTrigger,
  type ActionButtonTriggerProps,
} from "./ActionButtonTrigger";

const styles = {
  chat_trigger: css`
    position: fixed;
    bottom: 24px;
    right: 24px;

    @media screen and (min-width: 768px) {
      bottom: 32px;
      right: 24px;
    }
    @media screen and (min-width: 1024px) {
      bottom: 32px;
      right: 49px;
    }
  `,
};

export type FloatingActionButtonTriggerProps = ActionButtonTriggerProps;

export function FloatingActionButtonTrigger({
  className,
  ...props
}: FloatingActionButtonTriggerProps) {
  return (
    <ActionButtonTrigger
      className={classNames(styles.chat_trigger, className)}
      {...props}
    />
  );
}
