import { makeDataStreamer } from "./dataStreamer";
import { getMockRes } from "@jest-mock/express";
import type { OpenAIChatCompletionWithoutUsage } from "./llm";

const mockRes = getMockRes();
let res: typeof mockRes.res;
const dataStreamer = makeDataStreamer();
describe("Data Streaming", () => {
  beforeEach(() => {
    res = mockRes.res;
    dataStreamer.connect(res);
  });

  afterEach(() => {
    mockRes.clearMockRes();
    dataStreamer?.disconnect();
  });

  it("Flushes headers on connect to begin an SSE stream", () => {
    expect(res.flushHeaders).toHaveBeenCalledTimes(1);
  });

  it("Only connects through one Response at a time and safely rejects additional connections", () => {
    expect(() => dataStreamer.connect(res)).toThrow(Error);
    expect(res.flushHeaders).toHaveBeenCalledTimes(1);
  });

  it("Streams SSE data manually to the client", () => {
    dataStreamer.streamData({
      type: "delta",
      data: "test",
    });
    expect(res.write).toHaveBeenCalledTimes(1);
    expect(res.write).toHaveBeenCalledWith(
      `data: {"type":"delta","data":"test"}\n\n`
    );
    dataStreamer.streamData({
      type: "delta",
      data: "Once upon",
    });
    dataStreamer.streamData({
      type: "delta",
      data: "a time there was a",
    });
    dataStreamer.streamData({
      type: "delta",
      data: "very long string.",
    });
    expect(res.write).toHaveBeenCalledTimes(4);
    expect(res.write).toHaveBeenCalledWith(
      `data: {"type":"delta","data":"Once upon"}\n\n`
    );
    expect(res.write).toHaveBeenCalledWith(
      `data: {"type":"delta","data":"a time there was a"}\n\n`
    );
    expect(res.write).toHaveBeenCalledWith(
      `data: {"type":"delta","data":"very long string."}\n\n`
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
    expect(res.write).toHaveBeenCalledTimes(3);
  });

  it("Bails out when a client closes a connection", () => {
    res.emit("close");
    expect(res.end).toHaveBeenCalledTimes(1);
    expect(dataStreamer.disconnect).toHaveBeenCalledTimes(1);
    expect(dataStreamer.connected).toBe(false);
    expect(() =>
      dataStreamer.streamData({ type: "delta", data: "test" })
    ).toThrow(Error);
    expect(async () => {
      const s = {
        [Symbol.asyncIterator]() {
          return {
            async next() {
              return { done: true };
            },
          };
        },
      } as AsyncIterable<{ done: boolean }>;
      await dataStreamer.stream(s);
    }).toThrow(Error);
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
