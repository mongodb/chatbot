import { vi } from "vitest";
import { type EventSourceMessage } from "@microsoft/fetch-event-source";

type MockEvent = {
  id?: string;
  type?: string;
  data: string | Record<string, unknown>;
};

function createEventSourceMessage(
  data: string | Record<string, unknown>,
  { type, id }: { type?: string; id?: string } = {}
): EventSourceMessage {
  return {
    id: id ?? "",
    event: type ?? "",
    data: JSON.stringify(data),
    retry: 0,
  };
}

let events: EventSourceMessage[] = [];

export function __addMockEvents(...newEvents: MockEvent[]) {
  events = events.concat(
    newEvents.map((e) =>
      createEventSourceMessage(e.data, { type: e.type, id: e.id })
    )
  );
}

export function __clearMockEvents() {
  events = [];
}

export const fetchEventSource = vi.fn(async (_url, options) => {
  const {
    // signal,
    // method,
    // headers,
    // body,
    // openWhenHidden,
    // onerror,
    onmessage,
    onopen,
    onclose,
  } = options;

  return new Promise((resolve, _reject) => {
    const body = new ReadableStream();
    const res = {
      ok: true,
      headers: new Headers({
        "content-type": "text/event-stream",
      }),
      redirected: false,
      status: 200,
      statusText: "",
      type: "cors",
      url: "",
      clone: () => res,
      body,
      bodyUsed: true,
      arrayBuffer: async () => new ArrayBuffer(0),
      blob: async () => new Blob(),
      formData: async () => new FormData(),
      json: async () => ({}),
      text: async () => "",
    } satisfies Response;
    onopen(res);
    for (const [i, event] of Object.entries(events)) {
      setTimeout(() => {
        onmessage(event);
        if (Number(i) === events.length - 1) {
          onclose(res);
          resolve(undefined);
        }
      }, 10);
    }
  });
});
