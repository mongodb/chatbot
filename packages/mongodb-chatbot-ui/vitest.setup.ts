import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// We overwrite console methods to suppress certain errors that are expected & distracting
const originalConsoleError = console.error;
console.error = function (...data) {
  // JSDom uses an outdated CSS parser that throws errors on valid modern CSS
  // See: https://github.com/jsdom/jsdom/issues/2177#issuecomment-376139329
  if (
    typeof data[0]?.toString === "function" &&
    data[0].toString().startsWith("Error: Could not parse CSS stylesheet")
  ) {
    return;
  }
  originalConsoleError(...data);
};

afterEach(() => {
  cleanup();
});
