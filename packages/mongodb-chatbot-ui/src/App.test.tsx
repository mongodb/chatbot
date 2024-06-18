import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import App from "./App";

const OriginalEventSource = global.EventSource;

beforeEach(() => {
  console.log("OriginalEventSource", OriginalEventSource);
  global.EventSource = OriginalEventSource;
});

test("loads the app", async () => {
  render(<App />);

  expect(
    screen.getByPlaceholderText("Ask MongoDB AI a Question")
  ).toBeInTheDocument();
});

async function testChatbotFlow({ stream }: { stream: boolean }) {
  if (stream === false) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.EventSource = undefined as any;
  }
  render(<App />);

  const inputBarTrigger = screen.getByPlaceholderText(
    "Ask MongoDB AI a Question"
  );

  // Click the input bar trigger and wait a bit for the initial "conversation created" request to complete
  await act(async () => {
    userEvent.click(inputBarTrigger);
    await new Promise((r) => setTimeout(r, 2000));
  });

  // Type a question and submit it by pressing enter
  await act(async () => {
    userEvent.type(inputBarTrigger, "What is MongoDB?{enter}");
  });

  // Ensure that the "answering" state is rendered while the response comes back
  await waitFor(() => {
    const inputBars = screen.getAllByPlaceholderText(
      "MongoDB AI is answering..."
    );
    expect(inputBars.length > 0).toBe(true);
  });

  // Wait for the response to come back, at which point the message should have a rating prompt
  await act(async () => {
    await new Promise((r) => setTimeout(r, 8000));
  });
  await waitFor(
    () => {
      expect(screen.getByText("How was the response?")).toBeInTheDocument();
      expect(screen.getByText(/MongoDB is/)).toBeInTheDocument();
    },
    { timeout: 6000 }
  );

  const inputBars = screen.getAllByPlaceholderText("Ask MongoDB AI a Question");
  expect(inputBars.length > 0).toBe(true);
}

test("Basic Q&A (awaited)", async () => {
  await testChatbotFlow({ stream: false });
}, 28000);

test.skip("Basic Q&A (streamed)", async () => {
  await testChatbotFlow({ stream: true });
}, 20000);
