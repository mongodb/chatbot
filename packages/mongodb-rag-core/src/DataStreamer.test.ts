import { DataStreamer, makeDataStreamer } from "./DataStreamer";
import { OpenAI } from "openai";
import { createResponse } from "node-mocks-http";
import { EventEmitter } from "events";
import { Response } from "express";

let res: ReturnType<typeof createResponse> & Response;
const dataStreamer = makeDataStreamer();
describe("Data Streaming", () => {
  beforeEach(() => {
    res = createResponse({
      eventEmitter: EventEmitter,
    });
    dataStreamer.connect(res);
  });

  afterEach(() => {
    if (dataStreamer.connected) {
      dataStreamer?.disconnect();
    }
  });

  it("Flushes headers on connect to begin an SSE stream", () => {
    expect(res.header("Content-Type")).toBe("text/event-stream");
    expect(res.header("Cache-Control")).toBe("no-cache");
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
    const stream: Parameters<DataStreamer["stream"]>[0]["stream"] = {
      [Symbol.asyncIterator]() {
        let current = 0;
        const msgs = ["Once upon", " a time there was a", " very long string."];
        const completions = msgs.map(createChatCompletionWithDelta);
        return {
          async next() {
            if (current < completions.length) {
              return { done: false, value: completions[current++] };
            } else {
              return { done: true, value: "" };
            }
          },
        };
      },
    };

    const streamedText = await dataStreamer.stream({ stream });
    expect(streamedText).toBe("Once upon a time there was a very long string.");
    const data = res._getData();
    expect(data).toBe(
      `data: {"type":"delta","data":"Once upon"}\n\ndata: {"type":"delta","data":" a time there was a"}\n\ndata: {"type":"delta","data":" very long string."}\n\n`
    );
  });
});

function createChatCompletionWithDelta(
  deltaText: string,
  i: number
): Omit<OpenAI.ChatCompletionChunk, "object" | "model"> {
  return {
    id: "test",
    created: Date.now(),
    choices: [
      {
        index: i,
        delta: {
          content: deltaText,
        },
        finish_reason: null,
      },
    ],
  };
}
