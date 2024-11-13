import { render, screen } from "@testing-library/react";
import { ErrorBanner } from "./Banner";

describe("Banner", () => {
  it("should render a banner with a default error message", async () => {
    render(<ErrorBanner />);
    const el = screen.queryByText(/Something went wrong/);
    expect(el).toBeInTheDocument();
  });

  it("should render the banner with a custom error message", async () => {
    render(<ErrorBanner message="whoopsie that isn't quite right" />);
    const el = screen.queryByText(/whoopsie that isn't quite right/);
    expect(el).toBeInTheDocument();
  });
});
