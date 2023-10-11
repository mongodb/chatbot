import Banner from "@leafygreen-ui/banner";

export type ErrorBannerProps = {
  message?: string;
  darkMode?: boolean;
};

export function ErrorBanner({
  message = "Something went wrong.",
  darkMode = false,
}: ErrorBannerProps) {
  return (
    <Banner darkMode={darkMode} variant="danger">
      {message}
      <br />
      Reload the page to start a new conversation.
    </Banner>
  );
}
