import Banner from "@leafygreen-ui/banner";
import { useDarkMode } from "@leafygreen-ui/leafygreen-provider";

export type ErrorBannerProps = {
  message?: string;
  darkMode?: boolean;
};

export function ErrorBanner(props: ErrorBannerProps) {
  const { message = "Something went wrong" } = props;
  const { darkMode } = useDarkMode();
  return (
    <Banner darkMode={props.darkMode ?? darkMode} variant="danger">
      {message}
      <br />
      Reload the page to start a new conversation.
    </Banner>
  );
}
