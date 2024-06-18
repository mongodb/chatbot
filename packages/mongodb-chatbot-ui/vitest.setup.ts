import { vi } from "vitest";
// import { EventSourcePolyfill as EventSource } from "event-source-polyfill";
import EventSource from "eventsource";

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo
Element.prototype.scrollTo = () => {
  // Do nothing
};

// Mock EventSource
// TODO: @microsoft/fetch-event-source isn't playing nicely with polyfills. For now we skip the streaming test, but we should fix this.
// global.EventSource = EventSourcePolyfill;
