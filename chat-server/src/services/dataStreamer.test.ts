import { makeDataStreamer } from "./dataStreamer";
import type { OpenAIChatCompletionWithoutUsage, OpenAiStreamingResponse } from "./llm";
import { createResponse } from "node-mocks-http";
import { EventEmitter } from "events";

let res: ReturnType<typeof createResponse>;
const dataStreamer = makeDataStreamer();
describe("Data Streaming", () => {
  beforeEach(() => {
    res = createResponse({
      eventEmitter: EventEmitter,
    });
    dataStreamer.connect(res);
  });

  afterEach(() => {
    if(dataStreamer.connected) {
      dataStreamer?.disconnect();
    }
  });

  it("Flushes headers on connect to begin an SSE stream", () => {
    expect(res.header("Content-Type")).toBe("text/event-stream");
    expect(res.header("Cache-Control")).toBe("no-cache");
    expect(res.header("Access-Control-Allow-Origin")).toBe("*");
    expect(res.header("Access-Control-Allow-Credentials")).toBe("true");
    expect(res.header("Connection")).toBe("keep-alive");
  });

  it("Only connects through one Response at a time and safely rejects additional connections", () => {
    expect(() => dataStreamer.connect(res)).toThrow(Error);
  });

  it("Streams SSE data manually to the client", () => {
    dataStreamer.streamData({
      type: "delta",
      data: "test",
    });
    dataStreamer.streamData({
      type: "delta",
      data: "Once upon",
    });
    dataStreamer.streamData({
      type: "delta",
      data: " a time there was a",
    });
    dataStreamer.streamData({
      type: "delta",
      data: " very long string.",
    });
    const data = res._getData();
    expect(data).toBe(
      `data: {"type":"delta","data":"test"}\n\ndata: {"type":"delta","data":"Once upon"}\n\ndata: {"type":"delta","data":" a time there was a"}\n\ndata: {"type":"delta","data":" very long string."}\n\n`
    );
  });

  it("Streams events from an AsyncIterable to the client", async () => {
    const stream = {
      [Symbol.asyncIterator]() {
        let current = 0;
        const completions = [
          createChatCompletionWithDelta("Once upon"),
          createChatCompletionWithDelta(" a time there was a"),
          createChatCompletionWithDelta(" very long string."),
        ];
        return {
          async next() {
            if (current < completions.length) {
              return { done: false, value: completions[current++] };
            } else {
              return { done: true };
            }
          },
        };
      },
    } as AsyncIterable<OpenAIChatCompletionWithoutUsage>;

    const streamedText = await dataStreamer.stream({ stream });
    expect(streamedText).toBe("Once upon a time there was a very long string.");
    const data = res._getData();
    expect(data).toBe(`data: {"type":"delta","data":"Once upon"}\n\ndata: {"type":"delta","data":" a time there was a"}\n\ndata: {"type":"delta","data":" very long string."}\n\n`);
  });

  it("Bails out when a client closes a connection", async () => {
    res.emit("close");
    expect(dataStreamer.connected).toBe(false);
    expect(() =>
      dataStreamer.streamData({ type: "delta", data: "test" })
    ).toThrow(Error);
    await expect(async () => {
      const stream = {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              return {
                done: true,
              };
            },
          };
        },
      } as OpenAiStreamingResponse;
      await dataStreamer.stream({ stream });
    }).rejects.toThrow(Error);
  });
});

function createChatCompletionWithDelta(deltaText: string) {
  return {
    id: Date.now().toString(),
    created: Date.now() / 1000,
    choices: [
      createChatCoice({
        index: 0,
        delta: true,
        message: {
          content: deltaText,
        },
      }),
    ],
  };
}

function createChatCoice(data: {
  index: number;
  delta: boolean;
  message: { role?: "assistant" | "user"; content: string };
}) {
  return {
    index: data.index,
    finishReason: null,
    delta: data.delta ? data.message : undefined,
    message: data.delta ? undefined : data.message,
  };
}
