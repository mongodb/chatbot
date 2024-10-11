import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ObjectId } from "mongodb-rag-core";
import createFetchMock from "vitest-fetch-mock";
import { App } from "./App";

const fetchMocker = createFetchMock(vi);
// sets globalThis.fetch and globalThis.fetchMock to our mocked version
fetchMocker.enableMocks();

function renderApp() {
  process.env.VITE_GIT_COMMIT = "test-git-commit";
  return render(<App />);
}

describe("Test App", () => {
  it("renders the App component", async () => {
    renderApp();
    expect(screen.getByText("MongoDB AI Chatbot Test App")).toBeInTheDocument();
  });

  it("includes a TextInputTrigger and ActionButtonTrigger component", async () => {
    renderApp();
    const textInputTrigger = screen.getByRole("textbox");
    expect(textInputTrigger).toBeInTheDocument();

    const actionButtonTrigger = screen.getByRole("button", {
      name: /Ask MongoDB AI/,
    });
    expect(actionButtonTrigger).toBeInTheDocument();
  });

  // Skipping due to an "Error: require() of ES Module" error. Something isn't configured correctly with react-markdown.
  // https://jira.mongodb.org/browse/EAI-589
  it.skip("opens the Modal view when the ActionButtonTrigger is clicked", async () => {
    renderApp();
    const actionButtonTrigger = screen.getByRole("button", {
      name: /Ask MongoDB AI/,
    });
    fetchMocker.mockOnce(
      new Response(
        JSON.stringify({
          _id: new ObjectId().toHexString(),
          createdAt: Date.now(),
          messages: [],
        }),
        { status: 200 }
      )
    );
    await act(async () => {
      actionButtonTrigger.click();
    });
    await waitFor(async () => {
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });
  });

  // Skipping due to an "Error: require() of ES Module" error. Something isn't configured correctly with react-markdown.
  // https://jira.mongodb.org/browse/EAI-589
  it.skip("opens the Modal view when the TextInputTrigger submits for the first time", async () => {
    renderApp();
    const textInputTrigger = screen.getByRole("textbox");

    fetchMocker.mockOnce(
      new Response(
        JSON.stringify({
          _id: new ObjectId().toHexString(),
          createdAt: Date.now(),
          messages: [],
        }),
        { status: 200 }
      )
    );
    await act(async () => {
      textInputTrigger.focus();
      await userEvent.type(textInputTrigger, "Hello from the user");
    });

    fetchMocker.mockOnce(
      new Response(
        JSON.stringify({
          _id: new ObjectId().toHexString(),
          role: "assistant",
          content: "Hello from the assistant",
          createdAt: Date.now(),
          references: [
            {
              title: "Some docs page",
              url: "https://mongodb.com/docs/",
              metadata: {
                sourceName: "snooty-docs",
                tags: ["docs", "manual"],
                sourceType: "Docs",
              },
            },
          ],
        }),
        { status: 200 }
      )
    );
    await act(async () => {
      await userEvent.type(textInputTrigger, "{enter}");
    });
    await waitFor(async () => {
      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });
  });
});
